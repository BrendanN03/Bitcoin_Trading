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

app.post('/register', routes.register);
app.post('/login', routes.login);
app.get('/session', routes.session);

app.listen(config.server_port, () => {
	console.log(`Server running at http://${config.server_host}:${config.server_port}/`)
});

module.exports = app;
