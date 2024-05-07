const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const config = require('./config');
const routes = require('./routes');

const app = express();
app.use(cors({
	origin: 'http://localhost:3000',
	credentials: true
}));
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser());

// handle routing
app.get('/trends/:datetime', routes.trends);
app.get('/monthly_summary', routes.monthlySummary);
app.get('/special_days/:month', routes.specialDays);
app.get('/top_weeks', routes.topWeeks);
app.get('/day_tweets/:datetime', routes.dayTweets);
app.get('/fluctuations', routes.fluctuations);
app.get('/tweet_activity/:date', routes.tweetActivity);
app.get('/past_info/:date', routes.pastInfo);
app.get('/total_traded/:user', routes.totalTraded);
app.get('/total_holdings/:date', routes.totalHoldings);
app.post('/register', routes.register);
app.post('/login', routes.login);
app.post('/logout', routes.logout);
app.get('/session', routes.session);
app.post('/transact', routes.transact);

// start the server
app.listen(config.server_port, () => {
	console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
