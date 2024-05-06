import  '../styles.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, Tooltip, Legend, ReferenceLine, ResponsiveContainer, CartesianGrid} from 'recharts';
import React, { useContext } from 'react';
import { DateTimeContext } from '../components/commonDate';

const config = require('../config.json');

export default function PageA() {
	const [balance, setBalance] = useState(100000);
	const [bitcoinBalance, setBitcoinBalance] = useState(0);
	const [price, setPrice] = useState(0);
	const [buyQuantity, setBuyQuantity] = useState(1);
	const [sellQuantity, setSellQuantity] = useState(1);

	const [authSide, setAuthSide] = useState(true); // false = register; true = login
	const [loggedUser, setLoggedUser] = useState(null);
	//const [currentDateTime, setCurrentDateTime] = useState(getRandomDateIn2021);
	const { currentDateTime, setCurrentDateTime } = useContext(DateTimeContext);

	//for graph
	const [chartData, setChartData] = useState([]);

	const handleBuy = () => {
		if (price != 0) {
			const origUSD = balance;
			const origBTC = bitcoinBalance;
			setBalance(prevBalance => prevBalance - buyQuantity);
			setBitcoinBalance(prevBalance => prevBalance + 1.0 * buyQuantity / price);

			if (loggedUser) {
				fetch(`http://${config.server_host}:${config.server_port}/transact`, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify({
						user: loggedUser,
						date: currentDateTime,
						amount: buyQuantity,
						type: 'buy',
						new_usd: origUSD - buyQuantity,
						new_btc: origBTC + 1.0 * buyQuantity / price
					}),
					headers: {
						'Content-type': 'application/json; charset=UTF-8'
					}
				});
			}
		}

		const now = new Date(currentDateTime.getTime());
		const msUntilNextMinute = 60000 - (now.getSeconds() * 1000 + now.getMilliseconds());
		setCurrentDateTime(prevDateTime => new Date(prevDateTime.getTime() + msUntilNextMinute));
	};

	const handleSell = () => {
		if (price != 0) {
			const origUSD = balance;
			const origBTC = bitcoinBalance;
			const quantity = bitcoinBalance * sellQuantity / 100.0;
			setBitcoinBalance(prev => prev - quantity);
			setBalance(prev => parseFloat((prev + quantity * price).toFixed(2)));

			if (loggedUser) {
				fetch(`http://${config.server_host}:${config.server_port}/transact`, {
					method: 'POST',
					credentials: 'include',
					body: JSON.stringify({
						user: loggedUser,
						date: currentDateTime,
						amount: parseFloat((origUSD + quantity * price).toFixed(2)) - origUSD,
						type: 'sell',
						new_usd: parseFloat((origUSD + quantity * price).toFixed(2)),
						new_btc: origBTC - quantity
					}),
					headers: {
						'Content-type': 'application/json; charset=UTF-8'
					}
				});
			}
		}

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

	/*
	function getRandomDateIn2021() { // initializes time incrementing
		const start = new Date('2021-01-01T00:00:00Z');
		const end = new Date('2021-12-31T23:59:59Z');
		return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
	}
	// const [currentDateTime, setCurrentDateTime] = useState(getRandomDateIn2021());
	*/

	useEffect(() => { // time incrementing
		fetchData(currentDateTime);
		/*
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
		*/
	}, [currentDateTime]);

	function fetchData(dateTime) {
		const formattedDateTime = dateTime.toISOString();
		const url = `http://${config.server_host}:${config.server_port}/past_info/${currentDateTime.toISOString()}$`;
	
		fetch(url)
			.then(response => {
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				return response.json();
			})
			.then(data => {
				const formattedData = data.map(item => ({
					date: item.minute_formatted,
					price: parseFloat(item.close),
				}));
				setChartData(formattedData);
				if (formattedData.length > 0) {
					setPrice(formattedData[formattedData.length - 1].price);
				}
			})
			.catch(error => {
				console.error('Error fetching data:', error);
			});
	}

	

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
			.then(resJson => {
				if (resJson.length != 0) {	
					setLoggedUser(resJson.user);
					if (resJson.user) {
						setBalance(resJson.curr_usd);
						setBitcoinBalance(resJson.curr_btc);
					}
				}
			},
				 // TODO: below is a mysterious reject handler; remove it? original was just _ => {}
				_ => {
				fetch(`http://${config.server_host}:${config.server_port}/past_info/${currentDateTime.toISOString()}$`)
				.then(res => res.json())
				.then(data => {	
				});
			});
	}, []);

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

	// handle changing login/register form
	const authChangeHandle = (toLogin) => {
		if (toLogin) {
			document.getElementById('register_username').value = '';
			document.getElementById('register_password').value = '';
			document.getElementById('register_password_confirm').value = '';
		} else {
			document.getElementById('login_username').value = '';
			document.getElementById('login_password').value = '';
		}

		setAuthSide(toLogin);
		document.getElementById('auth_msg').innerHTML = '';
	}

	// handle registering account
	const registerSubmit = (e) => {
		e.preventDefault();
		
		const username = document.getElementById('register_username').value;
		const password = document.getElementById('register_password').value;
		const authMsgElt = document.getElementById('auth_msg');

		// check if the passwords match
		if (password !== document.getElementById('register_password_confirm').value) {
			authMsgElt.innerHTML = "Passwords don't match";
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
					authMsgElt.innerHTML = 'Something went wrong';
				} else if (res.status === 409) {
					authMsgElt.innerHTML = 'Username is taken';
				} else if (res.status === 201) {
					authMsgElt.innerHTML = 'You have successfully registered';
					setAuthSide(true);
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
		const authMsgElt = document.getElementById('auth_msg');

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
					authMsgElt.innerHTML = 'Something went wrong';
				} else if (res.status === 404) {
					authMsgElt.innerHTML = 'Incorrect credentials';
				} else if (res.status === 200) {
					authMsgElt.innerHTML = 'Login successful';
					setLoggedUser(username);
					return res.json();
				} else {
					console.log('loginSubmit: what happened here');
					throw new Error('what happen');
				}
				return Promise.reject(res);
			})
			.then(resJson => {
				setBalance(resJson.curr_usd);
				setBitcoinBalance(resJson.curr_btc);
			}, _ => {});
		
	}

	// handle account logout
	const logout = (e) => {
		fetch(`http://${config.server_host}:${config.server_port}/logout`, {
			method: 'POST',
			credentials: 'include'
		});
		setLoggedUser(null);
		document.getElementById('auth_msg').innerHTML = '';
	}

	return (
		<>
			<div className="headerContainer">
				<div style={{ fontWeight: 'bold', fontSize: '18px', margin: '10px 0' }}>Crypto Conquest</div>
				<Link to='/a' className="buttonLink">Game</Link>
				<Link to='/b' className="buttonLink">Analytics</Link>
				<Link to='/c' className="buttonLink">Historical Data</Link>
			</div>

            {/* Forms and user interaction components */}
            <div style={{ width: '100%', height: "65vh" }}>
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

			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '5vh' }}>
				<p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold' }}>Current Time: {currentDateTime.toISOString().replace('T', ' ').replace('Z', '')}</p>
			</div>


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
				<div className="input-container">
					<label htmlFor="balance" className="label">Current Balance (USD):</label>
					<input type="text" id="balance" value={balance} readOnly className="input" />
				</div>
				<div className="input-container">
					<label htmlFor="bitcoinBalance" className="label">Current Balance (BTC):</label>
					<input type="text" id="bitcoinBalance" value={bitcoinBalance} readOnly className="input" />
				</div>
				<div className="input-container">
					<label htmlFor="price" className="label">Current BTC Price:</label>
					<input type="text" id="price" value={price} readOnly className="input" />
				</div>
				<div className="input-container">
					<label htmlFor="netProfit" className="label">Net Profit:</label>
					<input type="text" id="netProfit" value={balance + bitcoinBalance * price - 100000} readOnly className="input" />
				</div>

			</div>

			<div className='centerer'>
				<div className='auth-container'>
					{
					loggedUser ?
						<>
							<span>Hello, {loggedUser}! </span>
							<button type='button' onClick={logout}>Logout</button>
						</>
					: authSide ?
						<div>
							<div className="login-form">
								<form onSubmit={loginSubmit}>
									<input id='login_username' type='text' name='username' placeholder='Username' minLength='5' maxLength='10' required />
									<input id='login_password' type='password' name='password' placeholder='Password' minLength='5' maxLength='15' required />
									<button type='submit'>Login</button>
								</form>
								<button onClick={() => authChangeHandle(false)}>Don't have an account?</button>
							</div>
						</div>
					:
						<div>
							<div className="register-form">
								<form onSubmit={registerSubmit}>
									<input id='register_username' type='text' name='username' placeholder='Username' minLength='5' maxLength='10' required />
									<input id='register_password' type='password' name='password' placeholder='Password' minLength='5' maxLength='15' required />
									<input id='register_password_confirm' type='password' name='password_confirm' placeholder='Confirm Password' minLength='5' maxLength='15' required />
									<button type='submit'>Register</button>
								</form>
								<button onClick={() => authChangeHandle(true)}>Already have an account?</button>
							</div>
						</div>
					}
					<p id='auth_msg' />
				</div>
			</div>
		</>
	);
}
