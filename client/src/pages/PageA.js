import  '../styles.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ReferenceLine, ResponsiveContainer, CartesianGrid} from 'recharts';

const config = require('../config.json');

export default function PageA() {
	const [balance, setBalance] = useState(100000);
	const [bitcoinBalance, setBitcoinBalance] = useState(0);
	const [price, setPrice] = useState(0);
	const [buyQuantity, setBuyQuantity] = useState(1);
	const [sellQuantity, setSellQuantity] = useState(1);

	const [loggedUser, setLoggedUser] = useState(null);

	//for graph
	const [chartData, setChartData] = useState([]);

	const handleBuy = () => {
		if (price != 0) {
			setBalance(prevBalance => prevBalance - buyQuantity);
			setBitcoinBalance(prevBalance => prevBalance + 1.0 * buyQuantity / price);
		}

		const now = new Date(currentDateTime.getTime());
		const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
		setCurrentDateTime(prevDateTime => new Date(prevDateTime.getTime() + msUntilNextMinute));
	};

	const handleSell = () => {
		const quantity = bitcoinBalance * sellQuantity / 100.0;
		setBitcoinBalance(prev => prev - quantity);
		setBalance(prev => prev + quantity * price);

		const now = new Date(currentDateTime.getTime());
		const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
		setCurrentDateTime(prevDateTime => new Date(prevDateTime.getTime() + msUntilNextMinute));
	}

	const handleBuyQuantityChange = (event) => {
		setBuyQuantity(parseInt(event.target.value));
	};

	const handleSellQuantityChange = (event) => {
		setSellQuantity(parseInt(event.target.value));
	};

	/*
	ORIGINAL TIME HANDLING CODE (in case of catastrophe)
	
	function getRandomDateIn2021() { // initializes time incrementing
		const start = new Date('2021-01-01T00:00:00Z');
		const end = new Date('2021-12-31T23:59:59Z');
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	}
	const [currentDateTime, setCurrentDateTime] = useState(getRandomDateIn2021());

	useEffect(() => { // time incrementing
		function syncTime() {
			const now = new Date(currentDateTime.getTime());
			const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
			setTimeout(() => {
				setCurrentDateTime(new Date(now.getTime() + 60000));
				syncTime();
			}, msUntilNextMinute);
		}
	
		syncTime();
		return () => clearTimeout(syncTime);
	}, [currentDateTime]);
	*/

	function getRandomDateIn2021() { // initializes time incrementing
		const start = new Date('2021-01-01T00:00:00Z');
		const end = new Date('2021-12-31T23:59:59Z');
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	}
	const [currentDateTime, setCurrentDateTime] = useState(getRandomDateIn2021());

	useEffect(() => { // time incrementing
		function syncTime() {
			const now = new Date(currentDateTime.getTime());
			const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
			setTimeout(() => {
				setCurrentDateTime(new Date(now.getTime() + 60000));
				syncTime();
			}, msUntilNextMinute);
		}
	
		syncTime();
		return () => clearTimeout(syncTime);
	}, [currentDateTime]);
	

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
			.then(resJson => setLoggedUser(resJson.user), _ => {
				fetch(`http://${config.server_host}:${config.server_port}/past_info/${currentDateTime.toISOString()}$`)
				.then(res => res.json())
				.then(data => {	
				});
			});
		
		fetch(`http://${config.server_host}:${config.server_port}/past_info/${currentDateTime.toISOString()}$`)
			.then(res => res.json())
			.then(data => {
				//setChartData(data.map(item => ({
				//	date: item.btc_date,
				//	price: parseFloat(item.close)
				//})));
				
				const newData = data.map(item => {
					const date = new Date(item.string_date);
					const hour = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:00`;
					return {
						//date: date.toISOString().substring(0, 10),
						date: item.minute_formatted,
						price: parseFloat(item.close),
						hour
					};
				});
				setPrice(newData[newData.length - 1].price);
				setChartData(newData);	
			});
	}, [currentDateTime]);

	/*
	MORE ORIGINAL GRAPH/TIME HANDLING CODE

	fetch(`http://${config.server_host}:${config.server_port}/past_info/${currentDateTime.toISOString()}$`)
			.then(res => res.json())
			.then(data => {
				//setChartData(data.map(item => ({
				//	date: item.btc_date,
				//	price: parseFloat(item.close)
				//})));
				
				const newData = data.map(item => {
					const date = new Date(item.string_date);
					const hour = `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${('0' + date.getDate()).slice(-2)} ${('0' + date.getHours()).slice(-2)}:00`;
					return {
						//date: date.toISOString().substring(0, 10),
						date: item.minute_formatted,
						price: parseFloat(item.close),
						hour
					};
				});
				setChartData(newData);	
			});
		
		// return () => clearInterval(timerId);
	}, [currentDateTime]);
	*/

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
		fetch(`http://${config.server_host}:${config.server_port}/logout`, {
			method: 'POST',
			credentials: 'include'
		});
		setLoggedUser(null);
	}
	

	return (
		<>
			<div className="headerContainer">
				<Link to='/a' className="buttonLink">Game</Link>
				<Link to='/b' className="buttonLink">Analytics</Link>
				<Link to='/c' className="buttonLink">Historical Data</Link>
			</div>

            {/* Forms and user interaction components */}
            <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                    <LineChart data={chartData}>
						<XAxis dataKey="date" />
                    	<YAxis type="number" domain={['auto', 'auto']} />
                    	<Tooltip />
                    	<Legend />
                        <Line type="linear" dataKey="price" stroke="#8884d8" dot={false} />
						<CartesianGrid horizontal={false}/>
                    </LineChart>
                </ResponsiveContainer>
            </div>

			<p>current time: {currentDateTime.toISOString().replace('T', ' ').replace('Z', '')}</p>

			{/* BN */}
			<div className="transaction-container">
				<div>
					<button onClick={() => { handleBuy();}} className="buyButton">Buy ($)</button>
					<input
						type="range"
						min="1"
						max={balance}
						value={buyQuantity}
						onChange={handleBuyQuantityChange}
					/>
					<input
						type="number"
						min="1"
						max={balance}
						value={buyQuantity}
						onChange={handleBuyQuantityChange}
					/>

					<button onClick={() => { handleSell();}} className="sellButton">Sell (%)</button>
					<input
						type="range"
						min="1"
						max="100"
						value={sellQuantity}
						onChange={handleSellQuantityChange}
					/>
					<input
						type="number"
						min="1"
						max="100"
						value={sellQuantity}
						onChange={handleSellQuantityChange}
					/>

				</div>
				<div>
					<label htmlFor="balance">Current Balance (USD):</label>
					<input type="text" id="balance" value={balance} readOnly />
				</div>
				<div>
					<label htmlFor="bitcoinBalance">Current Balance (BTC):</label>
					<input type="text" id="bitcoinBalance" value={bitcoinBalance} readOnly />
				</div>
				<div>
					<label htmlFor="price">Current BTC Price:</label>
					<input type="text" id="price" value={price} readOnly />
				</div>
				<div>
					<label htmlFor="netProfit">Net Profit:</label>
					<input type="text" id="netProfit" value={balance + bitcoinBalance * price - 100000} readOnly />
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
