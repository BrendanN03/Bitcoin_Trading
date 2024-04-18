const mysql = require('mysql2')
const config = require('./config.json')

const connection = mysql.createConnection({
	host: config.rds_host,
	user: config.rds_user,
	password: config.rds_password,
	port: config.rds_port,
	database: config.rds_db
});
connection.connect((err) => err && console.log(err));

const register = async function (req, res) {
	console.log(`[register] body: ${JSON.stringify(req.body)}`);

	// first check if the username already exists
	connection.query(`
		SELECT u.id
		FROM user u
		WHERE u.username = '${req.body.username}';
	`, checkUserExistsHandler);

	function checkUserExistsHandler(err, data) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		} else if (data.length != 0) {
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
	now.setTime(now.getTime() + 600000); // 10 minutes
	const expiration = now.toISOString().slice(0, 19).replace('T', ' ');

	connection.query(`
		SELECT u.id, s.sid
		FROM user u
		LEFT JOIN session s ON u.id = s.user_id
		WHERE u.username = '${req.body.username}' AND
		      u.password = '${req.body.password}';
	`, loginVerifyHandler);

	function loginVerifyHandler(err, data) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		} else if (data.length == 0) {
			// credentials are invalid
			res.sendStatus(404);
			return;
		} else if (data[0].sid) {
			// there is already a session for the user, so update it
			connection.query(`
				UPDATE session
				SET expire = '${expiration}'
				WHERE user_id = ${data[0].id};
			`, (err, _) => {
				if (err) {
					console.log(err);
					res.sendStatus(500);
				} else {
					res.cookie('sid', data[0].sid, { maxAge: 600000, httpOnly: true });
					res.sendStatus(200);
				}
			})
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
			if (err.code === 'ER_DUP_ENTRY') {
				
			} else {
				// its just some other error
				console.log(err);
				res.sendStatus(500);
			}

			return;
		}

		connection.query(`
			SELECT s.sid
			FROM session s
			WHERE s.user_id = ${data[0].id};
		`, sessionIdHandler);
	}

	function sessionIdHandler(err, data) {
		if (err) {
			console.log(err);
			res.sendStatus(500);
			return;
		}

		res.cookie('sid', data[0].sid, { maxAge: 600000, httpOnly: true });
		res.sendStatus(200);
	}
}

const session = async function (req, res) {
	console.log(`[session] cookies: ${JSON.stringify(req.cookies)}`)

	// they do not have a session cookie
	if (!req.cookies.sid) {
		res.status(200).json({ user: null });
		return;
	}
	
	const now = new Date();
	const dateTime = now.toISOString().slice(0, 19).replace('T', ' ');
	
	// validate the session cookie
	connection.query(`
		SELECT u.username, s.expire
		FROM session s
		JOIN user u ON s.user_id = u.id
		WHERE s.sid = ${req.cookies.sid};
	`, (err, data) => {
		if (err) {
			console.log(err);
			res.status(500).json({});
		}
		
		// there is no sid associated with the session cookie
		else if (data.length == 0) {
			res.cookie('sid', null, { maxAge: 0, expires: new Date(0), httpOnly: true })
			res.status(400).json({});
		}
		
		// the session has already expired
		else if (data[0].expire <= dateTime) {
			/* insert function that deletes from session table if wanted; otherwise merge with above conditional */
			res.cookie('sid', null, { maxAge: 0, expires: new Date(0), httpOnly: true })
			res.status(400).json({});
		}

		// the session is valid
		else {
			res.status(200).json({ user: data[0].username });
		}
	});
}

module.exports = {
	register,
	login,
	session
}
