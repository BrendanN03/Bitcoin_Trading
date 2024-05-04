import  '../styles.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const config = require('../config.json');

export default function PageA() {
	const [balance, setBalance] = useState(100000);
	const [quantity, setQuantity] = useState(1);
	const [isBuying, setIsBuying] = useState(true);

	const [loggedUser, setLoggedUser] = useState(null);
	const [chartData, setChartData] = useState({});
	const [date, setDate] = useState(null);

	const [someTweets, setSomeTweets] = useState(null); // TODO: figure out the correct default value
	

	const handleTransaction = () => {
		const totalCost = quantity * 10;
		const totalEarned = quantity * 10;
	
		if (isBuying) {
			setBalance(prevBalance => prevBalance - totalCost);
		} else {
			setBalance(prevBalance => prevBalance + totalEarned);
		}
	};	

	const handleQuantityChange = (event) => {
		setQuantity(parseInt(event.target.value));
	};

	useEffect(() => {
		// see if we can authorize via cookie, in a dollar store way
		// will probably a real function later
		fetch(`http://${config.server_host}:${config.server_port}/session`, { credentials: 'include' })
			.then(res => {
				if (res.status !== 200) {
					return Promise.reject(res);
				}

				return res.json();
			})
			.then(resJson => setLoggedUser(resJson.user), _ => {});

		// get some tweets in a day
		// TODO: update route to handle limit
		const zzz_datetime = '2021-10-15 22:03:25'; // TODO: get a better name or a real source for datetime
		fetch(`http://${config.server_host}:${config.server_port}/day_tweets/${zzz_datetime}`)
			.then(res => res.json()) // TODO: may handle status code 500
			.then(resJson => {
				setSomeTweets(resJson.map(({ name, verified, date, text }) => {
					const v = verified ? '(Verified)' : '(Unverified)';
					return <li>from {name} {v} on {date}: {text}</li>;
				}));
			});

		fetch(`http://${config.server_host}:${config.server_port}/monthly-summary`)
			.then(res => res.json())
			.then(data => {
				setChartData(data.map(item => ({
					month: item.month,
					avgClose: item.avg_close,
				})));
			});
	}, []);

	// handle registering account
	const registerSubmit = (e) => {
		e.preventDefault();
		
		const username = document.getElementById('register_username').value;
		const password = document.getElementById('register_password').value;
		const registerMsgElt = document.getElementById('register_msg');

		// check if the passwords match
		if (password !== document.getElementById('register_password_confirm').value) {
			registerMsgElt.innerHTML = "Passwords don't match";
			return;
		}

		// make the POST request
		fetch(`http://${config.server_host}:${config.server_port}/register`, {
			method: 'POST',
			body: JSON.stringify({
				username: username,
				password: password
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8'
			}
		})
			.then(res => {
				if (res.status === 500) {
					registerMsgElt.innerHTML = 'Something went wrong';
				} else if (res.status === 409) {
					registerMsgElt.innerHTML = 'Username is taken';
				} else if (res.status === 201) {
					registerMsgElt.innerHTML = 'You have successfully registered';
				} else {
					console.log('registerSubmit: what happened here');
					throw new Error('what happen');
				}
			});
	}

	// handle account login
	const loginSubmit = (e) => {
		e.preventDefault();

		const username = document.getElementById('login_username').value;
		const password = document.getElementById('login_password').value;
		const loginMsgElt = document.getElementById('login_msg');

		// make the POST request
		fetch(`http://${config.server_host}:${config.server_port}/login`, {
			method: 'POST',
			credentials: 'include',
			body: JSON.stringify({
				username: username,
				password: password
			}),
			headers: {
				'Content-type': 'application/json; charset=UTF-8'
			}
		})
			.then(res => {
				if (res.status === 500) {
					loginMsgElt.innerHTML = 'Something went wrong';
				} else if (res.status === 404) {
					loginMsgElt.innerHTML = 'Incorrect credentials';
				} else if (res.status === 200) {
					loginMsgElt.innerHTML = 'Login successful';
					setLoggedUser(username);
				} else {
					console.log('loginSubmit: what happened here');
					throw new Error('what happen');
				}
			})
		
	}

	// handle account logout
	const logout = (e) => {
		fetch(`http://${config.server_host}:${config.server_port}/logout`, { credentials: 'include' });
		setLoggedUser(null);
	}

	return (
		<>
			<div className="headerContainer">
				<Link to='/b' className="buttonLink">Page B</Link>
			</div>

            {/* Forms and user interaction components */}
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={chartData}>
						<XAxis dataKey="date" />
                    	<YAxis type="number" domain={['auto', 'auto']} />
                    	<Tooltip />
                    	<Legend />
                        <Line type="monotone" dataKey="price" stroke="#8884d8" />
                    </LineChart>
                </ResponsiveContainer>
            </div>

			<ul id='someTweetsList'>{someTweets}</ul>
			
			{/* BN */}
			<div className="transaction-container">
				<div>
					<button onClick={() => { setIsBuying(true); handleTransaction();}} className="buyButton">Buy</button>
					<button onClick={() => { setIsBuying(false); handleTransaction();}} className="sellButton">Sell</button>

					<input
						type="range"
						min="1"
						max="100"
						value={quantity}
						onChange={handleQuantityChange}
					/>
					<input
						type="number"
						min="1"
						max="100"
						value={quantity}
						onChange={handleQuantityChange}
					/>
				</div>
				<div>
					<label htmlFor="balance">Current Balance:</label>
					<input type="text" id="balance" value={balance} readOnly />
				</div>
			</div>

			{/* register and submit might as well go on a separate page */}
			<div className="auth-container">
				<div className="register-form">
					<form onSubmit={registerSubmit}>
						<input id='register_username' type='text' name='username' placeholder='Username' minLength='5' maxLength='10' required />
						<input id='register_password' type='password' name='password' placeholder='Password' minLength='5' maxLength='15' required />
						<input id='register_password_confirm' type='password' name='password_confirm' placeholder='Confirm Password' minLength='5' maxLength='15' required />
						<button type='submit'>Register</button>
						<span id='register_msg' />
					</form>
				</div>

				<div className="login-form">
					<form onSubmit={loginSubmit}>
						<input id='login_username' type='text' name='username' placeholder='Username' minLength='5' maxLength='10' required />
						<input id='login_password' type='password' name='password' placeholder='Password' minLength='5' maxLength='15' required />
						<button type='submit'>Login</button>
						<span id='login_msg' />
					</form>
				</div>
			</div>


			{
			loggedUser ?
				<>
					<span>hi {loggedUser}</span>
					<button type='button' onClick={logout}>Logout</button>
				</>
					   :
				null
			}
		</>
	);
}
