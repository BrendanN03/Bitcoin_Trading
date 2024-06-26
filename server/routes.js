const mysql = require('mysql2')
const config = require('./config.json')

const connection = mysql.createConnection({
	host: config.rds_host,
	user: config.rds_user,
	password: config.rds_password,
	port: config.rds_port,
	database: config.rds_db,
	decimalNumbers: true
});
connection.connect((err) => err && console.log(err));

// refresh the user's session cookie
function refreshCookieData(expiration, sid, res, finals) {
	connection.query(`
		UPDATE session
		SET expire = '${expiration}'
		WHERE sid = ${sid};
	`, (err, _) => {
		if (err) {
			console.log(err);
			finals[1]();
		} else {
			res.cookie('sid', sid, { maxAge: 21600000, httpOnly: true });
			finals[0]();
		}
	});
}

// Query 1
const trends = async function (req, res) {
	console.log(`[trends] datetime: ${req.params.datetime} query params: ${JSON.stringify(req.query)}`);

	const datetime = req.params.datetime
	const interval = req.query.interval ?? 'week';
	const orderFlag = req.query.order ?? 1;
	const order = orderFlag ? 'ASC' : 'DESC';

	connection.query(`
		WITH influential_user_predictions_up AS (
			SELECT
				iupus.predicted_hour,
				iupus.${interval}_pred_up AS pred_up
			FROM influential_user_predictions_ups iupus
		),
		influential_user_predictions_down AS (
			SELECT
				iupds.predicted_hour,
				iupds.${interval}_pred_down AS pred_down
			FROM influential_user_predictions_downs iupds
		)
		SELECT
			ts.hour,
			ts.hourly_price_change,
			iupu.pred_up,
			iupd.pred_down,
			tv.total_trading_volume
		FROM time_series ts
		JOIN influential_user_predictions_up iupu ON ts.hour = iupu.predicted_hour
		JOIN influential_user_predictions_down iupd ON ts.hour = iupd.predicted_hour
		JOIN trading_volume tv ON ts.hour = tv.hour
		WHERE
			ts.hour <= '${datetime}' AND
			ts.hour >= DATE_FORMAT(DATE_SUB('${datetime}', INTERVAL 10 HOUR), '%Y-%m-%d %H:00:00')
		ORDER BY ts.hour ${order};
	`, (err, data) => {
		if (err) {
			console.log(err);
			res.status(500).json({});
		} else {
			res.status(200).json(data);
		}
	});
}


// Query 2
const monthlySummary = async function (req, res) {
	console.log(`[monthlySummary]`);

	connection.query(`
		SELECT
			abd.month,
			abd.avg_close,
			abd.avg_open,
			mft.max_followers,
			bt.text AS tweet_text
		FROM aggregated_bitcoin_data abd
		LEFT JOIN max_follower_tweets mft ON abd.month = mft.month
		LEFT JOIN bitcoin_tweets bt ON bt.user_followers = mft.max_followers;
	`, (err, data) => {
		if (err) {
			console.log(err);
			res.status(500).json({});
		} else {
			res.status(200).json(data);
		}
	});
}


// Query 3
const specialDays = async function (req, res) {
	console.log(`[specialDays] month: ${req.params.month}`);

	const input_month = req.params.month;

	connection.query(`
		WITH tweets_daily_average AS (
			SELECT
				DATE_FORMAT(bt.date, '%Y-%m-%d') AS day,
				COUNT(bt.id) AS tweet_count
			FROM bitcoin_tweets bt
			WHERE DATE_FORMAT(bt.date, '%Y-%m') = '${input_month}'
			GROUP BY day
		),
		bitcoin_daily_average AS (
			SELECT
				DATE_FORMAT(bp.date, '%Y-%m-%d') AS day,
				AVG(bp.open) AS avg_open,
				AVG(bp.close) AS avg_close
			FROM bitcoin_prices bp
			WHERE DATE_FORMAT(bp.date, '%Y-%m') = '${input_month}'
			GROUP BY day
		),
		daily_averages AS (
			SELECT
				bda.day,
				bda.avg_open,
				bda.avg_close,
				IFNULL(tda.tweet_count, 0) AS tweet_count
			FROM bitcoin_daily_average bda
			LEFT JOIN tweets_daily_average tda ON bda.day = tda.day
		),
		top_open_prices AS (
			SELECT da.day
			FROM daily_averages da
			ORDER BY da.avg_open DESC
			LIMIT 10
		),
		top_close_prices AS (
			SELECT da.day
			FROM daily_averages da
			ORDER BY da.avg_close DESC
			LIMIT 10
		),
		top_tweet_counts AS (
			SELECT da.day
			FROM daily_averages da
			ORDER BY da.tweet_count DESC
			LIMIT 10
		)
		SELECT DISTINCT
			da.day AS special_days,
			da.avg_open,
			da.avg_close,
			da.tweet_count
		FROM daily_averages da, top_open_prices top, top_close_prices tcp, top_tweet_counts ttc
		WHERE
			da.day = top.day OR
			da.day = tcp.day OR
			da.day = ttc.day;
	`, (err, data) => {
		if (err) {
			console.log(err);
			res.status(500).json({});
		} else {
			res.status(200).json(data);
		}
	});
}


// Query 4
const topWeeks = async function (req, res) {
	console.log(`[topWeeks]`);

	connection.query(`
		WITH weekly_differences AS (
			SELECT
				YEAR(bp.date) AS year,
				WEEK(bp.date) AS week,
				MIN(bp.date) AS date,
				MAX(bp.open) - MIN(bp.open) AS difference
			FROM bitcoin_prices bp
			GROUP BY year, week
		),
		top_weeks AS (
			SELECT wd.date, wd.year, wd.week
			FROM weekly_differences wd
			ORDER BY wd.difference DESC
			LIMIT 10
		)
		SELECT DISTINCT
			wd.date,
			wd.year,
			wd.week,
			wd.difference,
			bt.id AS tweet_id,
			bt.text AS tweet_text
		FROM weekly_differences wd
		JOIN top_weeks tw ON wd.year = tw.year AND wd.week = tw.week
		JOIN bitcoin_tweets bt ON YEAR(bt.date) = wd.year AND WEEK(bt.date) = wd.week
		LIMIT 10;
	`, (err, data) => {
		if (err) {
			console.log(err);
			res.status(500).json({});
		} else {
			res.status(200).json(data);
		}
	});
}

// Query 5
const dayTweets = async function (req, res) {
	console.log(`[dayTweets] datetime: ${req.params.datetime} query params: ${JSON.stringify(req.query)}`);
	
	const input_datetime = req.params.datetime;
	let limit = req.query.limit ?? 5;
	limit = limit < 0 ? 999999 : limit;

	connection.query(`
		SELECT bt.user_name, bt.user_verified, bt.date, bt.text
		FROM bitcoin_tweets bt
		WHERE
			DATE(bt.date) = DATE('${input_datetime}') AND
			bt.date < '${input_datetime}'
		ORDER BY bt.date DESC
		LIMIT ${limit};
	`, (err, data) => {
		if (err) {
			console.log(err);
			res.status(500).json({});
		} else {
			res.status(200).json(data);
		}
	});
}

// Query 6
const fluctuations = async function (req, res) {
	console.log(`[fluctuations]`);

	connection.query(`
		WITH daily_fluctuation AS (
			SELECT
				DATE(bp.date) AS day,
				MAX(bp.close) AS max_close,
				MIN(bp.close) AS min_close,
				MAX(bp.close) - MIN(bp.close) AS fluctuation
			FROM bitcoin_prices bp
			GROUP BY day
		),
		average_fluctuation AS (
			SELECT AVG(df.fluctuation) AS avg_fluctuation
			FROM daily_fluctuation df
		)
		SELECT
			df.day,
			df.max_close,
			df.min_close,
			df.fluctuation,
			df.fluctuation - af.avg_fluctuation AS difference,
			(df.fluctuation - af.avg_fluctuation) / af.avg_fluctuation * 100 AS percentage_difference
		FROM daily_fluctuation df, average_fluctuation af;
	`, (err, data) => {
		if (err) {
			console.log(err);
			res.status(500).json({});
		} else {
			res.status(200).json(data);
		}
	});
}

// Query 7
const tweetActivity = async function (req, res) {
	console.log(`[tweetActivity] query params: ${JSON.stringify(req.query)}`);

	const input_date = req.params.date;

	connection.query(`
		SELECT
			DATE(bt.date) AS day,
			COUNT(*) AS total_tweets,
			COUNT(DISTINCT bt.user_name) AS unique_users,
			SUM(bt.user_verified) AS verified_tweets,
			COUNT(DISTINCT
				CASE
					WHEN bt.user_followers > 10000 THEN bt.user_name
				END) AS influential_users
		FROM bitcoin_tweets bt
		WHERE DATE(bt.date) = '${input_date}';
	`, (err, data) => {
		if (err) {
			console.log(err);
			res.status(500).json({});
		} else {
			res.status(200).json(data);
		}
	});
}

// Query 8
const pastInfo = async function (req, res) {
	console.log(`[pastInfo] date: ${req.params.date}`);

	const input_datetime = req.params.date;

	connection.query(`
		SELECT * 
		FROM
			(SELECT
				bp.date - '2000-10-10T11:11:00.000Z' AS btc_date,
				bp.date AS string_date,
				EXTRACT(HOUR FROM bp.date) AS hour,
    			EXTRACT(MINUTE FROM bp.date) AS minute,
				DATE_FORMAT(bp.date, '%Y-%m-%d %H:%i') AS minute_formatted,
				bp.close
			FROM bitcoin_prices bp
			WHERE bp.date <= '${input_datetime}'
			ORDER BY bp.date DESC
			LIMIT 100) AS reverse
		ORDER BY btc_date ASC;
	`, (err, data) => {
		if (err) {
			console.log(err);
			res.status(500).json({});
		} else {
			res.status(200).json(data);
		}
	});
}

// Query 9
const totalTraded = async function (req, res) {
	console.log(`[totalTraded] user: ${req.params.user}`);

	connection.query(`
		SELECT
			CASE t.type
				WHEN 0 THEN 'sell'
				ELSE 'buy'
			END AS transaction_type,
			SUM(t.amount_traded) AS total_traded
		FROM transaction t
		JOIN user u ON t.user_id = u.id
		WHERE u.username = BINARY '${req.params.user}'
		GROUP BY transaction_type;
	`, (err, data) => {
		if (err) {
			console.log(err);
			res.status(500).json({});
		} else {
			res.status(200).json(data);
		}
	});
}

// Query 10
const totalHoldings = async function (req, res) {
	console.log(`[totalHoldings] date: ${req.params.date}`);

	const input_date = req.params.date;

	connection.query(`
		SELECT
			u.id,
			u.current_usd + (u.current_btc * b.close) AS total_usd_holdings
		FROM
			user u,
			(SELECT bp.close
			 FROM bitcoin_prices bp
			 WHERE bp.date = '${input_date}') b;
	`, (err, data) => {
		if (err) {
			console.log(err);
			res.status(500).json({});
		} else {
			res.status(200).json(data);
		}
	});
}

const register = async function (req, res) {
	console.log(`[register] body: ${JSON.stringify(req.body)}`);

	// first check if the username already exists
	connection.query(`
		SELECT u.id
		FROM user u
		WHERE u.username = BINARY '${req.body.username}';
	`, checkUserExistsHandler);

	function checkUserExistsHandler(err, data) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		} else if (data.length !== 0) {
			// the username already exists
			res.sendStatus(409);
			return;
		}
		
		// username doesn't exist so create the account
		connection.query(`
			INSERT INTO user (username, password)
			VALUES ('${req.body.username}', '${req.body.password}');
		`, createUserHandler);
	}

	function createUserHandler(err, _) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}

		res.sendStatus(201);
	}	
}

const login = async function (req, res) {
	console.log(`[login] body: ${JSON.stringify(req.body)}`);

	const now = new Date();
	now.setTime(now.getTime() + 21600000); // 6 hours 10 minutes
	const expiration = now.toISOString().slice(0, 19).replace('T', ' ');

	connection.query(`
		SELECT u.id, s.sid, u.current_btc, u.current_usd
		FROM user u
		LEFT JOIN session s ON u.id = s.user_id
		WHERE
			u.username = BINARY '${req.body.username}' AND
			u.password = BINARY '${req.body.password}';
	`, loginVerifyHandler);

	function loginVerifyHandler(err, data) {
		if (err) {
			console.log(err);
			res.status(500).json({});
			return;
		} else if (data.length === 0) {
			res.status(404).json({});
			return;
		} else if (data[0].sid) {
			// there is already a session for the user, so update it
			refreshCookieData(expiration, data[0].sid, res, [
				() => {
					res.status(200).json({ curr_btc: data[0].current_btc, curr_usd: data[0].current_usd })
				},
				() => { res.status(500).json({}); }
			]);
			return;
		}

		// user doesn't have a session
		// set a session id
		connection.query(`
			INSERT INTO session (user_id, expire)
			VALUES (${data[0].id}, '${expiration}');
		`, (err, _) => sessionInsertHandler(err, data));
	}

	// data is from first query
	function sessionInsertHandler(err, data) {
		if (err) {
			console.log(err);
			res.status(500).json({});
			return;
		}

		connection.query(`
			SELECT s.sid, u.current_btc, u.current_usd
			FROM session s
			JOIN user u ON s.user_id = u.id
			WHERE s.user_id = ${data[0].id};
		`, sessionIdHandler);
	}

	function sessionIdHandler(err, data) {
		if (err) {
			console.log(err);
			res.status(500).json({});
			return;
		}

		res.cookie('sid', data[0].sid, { maxAge: 21600000, httpOnly: true });
		res.status(200).json({ curr_btc: data[0].current_btc, curr_usd: data[0].current_usd })
	}
}

const logout = async function (req, res) {
	console.log(`[logout] cookies: ${JSON.stringify(req.cookies)}`);

	connection.query(`
		DELETE FROM session
		WHERE sid = ${req.cookies.sid}
	`, (err, _) => {
		if (err) {
			console.log(err);
		}
	})

	res.cookie('sid', null, { maxAge: 0, expires: new Date(0), httpOnly: true });
	res.sendStatus(200);
}

// TODO: can fetch anything about a user here i guess
const session = async function (req, res) {
	console.log(`[session] cookies: ${JSON.stringify(req.cookies)}`)

	// they do not have a session cookie
	if (!req.cookies.sid) {
		res.status(200).json({ user: null, curr_btc: null, curr_usd: null });
		return;
	}
	
	const now = new Date();
	const dateTime = now.toISOString().slice(0, 19).replace('T', ' ');
	
	// validate the session cookie
	connection.query(`
		SELECT u.username, s.expire, u.current_btc, u.current_usd
		FROM session s
		JOIN user u ON s.user_id = u.id
		WHERE s.sid = ${req.cookies.sid};
	`, (err, data) => {
		if (err) {
			console.log(err);
			res.status(500).json({});
		} else if (data.length === 0) {
			// there is no sid associated with the session cookie
			res.cookie('sid', null, { maxAge: 0, expires: new Date(0), httpOnly: true })
			res.status(400).json({});
		} else if (data[0].expire <= dateTime) {
			// the session has already expired
			// TODO: insert function that deletes from session table if wanted; otherwise merge with above conditional
			res.cookie('sid', null, { maxAge: 0, expires: new Date(0), httpOnly: true })
			res.status(400).json({});
		} else {
			// the session is valid, so refresh it
			now.setTime(now.getTime() + 21600000); // 6 hours 10 minutes
			const expiration = now.toISOString().slice(0, 19).replace('T', ' ');
			refreshCookieData(expiration, req.cookies.sid, res, [
				() => { res.status(200).json({ user: data[0].username, curr_btc: data[0].current_btc, curr_usd: data[0].current_usd }) },
				() => { res.status(500).json({}) }
			]);
		}
	});
}

const transact = function (req, res) {
	console.log(`[transact] body: ${JSON.stringify(req.body)}, cookies: ${JSON.stringify(req.cookies)}`);

	connection.query(`
		SELECT u.id
		FROM user u
		JOIN session s ON u.id = s.user_id
		WHERE
			u.username = BINARY '${req.body.user}' AND
			s.sid = ${req.cookies.sid};
	`, transactUserIdHandler);

	function transactUserIdHandler(err, data) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		} else if (data.length === 0) {
			// basically something about the username and session was bad
			res.sendStatus(400);
			return;
		}

		connection.query(`
			INSERT INTO transaction (user_id, date, amount_traded, type)
			VALUES (${data[0].id}, '${req.body.date}', ${req.body.amount}, ${Number(req.body.type === 'buy')});
		`, (err, _) => insertHandler(err, data[0].id));
	}

	// id is from first query
	function insertHandler(err, id) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}

		connection.query(`
			UPDATE user SET current_btc = ${req.body.new_btc} WHERE id = ${id};
		`, (err, _) => btcHandler(err, id));
	}

	// id is from first query
	function btcHandler(err, id) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}

		connection.query(`
			UPDATE user SET current_usd = ${req.body.new_usd} WHERE id = ${id};
		`, usdHandler);
	}

	function usdHandler(err, _) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}

		res.sendStatus(200);
	}
}

module.exports = {
	trends,
	monthlySummary,
	specialDays,
	topWeeks,
	dayTweets,
	fluctuations,
	tweetActivity,
	pastInfo,
	totalTraded,
	totalHoldings,
	register,
	login,
	logout,
	session,
	transact
}
