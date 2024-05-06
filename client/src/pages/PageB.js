import  '../styles.css';
import React, { useContext } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateTimeContext } from '../components/commonDate';

const config = require('../config.json');

export default function PageB() {
	const [loggedUser, setLoggedUser] = useState(null);
	const { currentDateTime, setCurrentDateTime } = useContext(DateTimeContext);

	useEffect(() => {
		// attempt authorization via session cookie
		fetch(`http://${config.server_host}:${config.server_port}/session`, { credentials: 'include' })
			.then(res => {
				if (res.status !== 200) {
					return Promise.reject(res);
				}

				return res.json();
			})
			.then(resJson => setLoggedUser(resJson.user), _ => {});
		
			fetch(`http://${config.server_host}:${config.server_port}/day_tweets/${currentDateTime.toISOString().replace('T', '%').replace('Z', '')}`)
				.then(res => res.json())
				.then(resJson => {
					const listContainer = document.getElementById('tweet-list');
					if (listContainer) {
						listContainer.innerHTML = '';
					}
					resJson.forEach(tweet => {
						const listItem = document.createElement('li');
						listItem.textContent = `${tweet.user_name}: ${tweet.text}`;
						if (listContainer) {
							listContainer.appendChild(listItem);
						}
					});
				});

			fetch(`http://${config.server_host}:${config.server_port}/trends/${currentDateTime.toISOString().replace('T', '%20').replace('Z', '')}`)
				.then(res => res.json())
				.then(resJson => {
					const listContainer = document.getElementById('trends-list');
					if (listContainer) {
						listContainer.innerHTML = '';
					}
					resJson.forEach(trend => {
							const listItem = document.createElement('li');
							listItem.textContent = `Hour: ${trend.hour}, Hourly Price Change: ${trend.hourly_price_change}, Prediction Up: ${trend.pred_up}, Prediction Down: ${trend.pred_down}, Total Trading Volume: ${trend.total_trading_volume}`;
							if (listContainer) {
								listContainer.appendChild(listItem);
							}
					});
				});

			fetch(`http://${config.server_host}:${config.server_port}/special_days/${currentDateTime.toISOString().replace('T', ' ').replace('Z', '').substring(0, 7)}`)
				.then(res => res.json())
				.then(resJson => {
					const listContainer = document.getElementById('special-day-list');
					if (listContainer) {
						listContainer.innerHTML = '';
					}
					resJson.forEach(specialDay => {
						if (specialDay.special_days < currentDateTime.toISOString().replace('T', ' ').replace('Z', '')) {
							const listItem = document.createElement('li');
							listItem.textContent = `Day: ${specialDay.special_days}, Average Close Price: ${specialDay.avg_close}, Number of Tweets: ${specialDay.tweet_count}`;
							if (listContainer) {
								listContainer.appendChild(listItem);
							}
						}
					})
				});

			
	}, []);

	// handle user logout
	const logout = () => {
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

			<div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '5vh' }}>
				<p style={{ fontSize: '16px', color: '#333', fontWeight: 'bold' }}>Current Time: {currentDateTime.toISOString().replace('T', ' ').replace('Z', '').substring(0, 19)}</p>
			</div>

			<div className="bars-container">
				<div>
					<h2>Tweets of the Day</h2>
					<ul id="tweet-list">
					</ul>
				</div>
				<div>
					<h2>Recent Predictive Tweets from Influential Users</h2>
					<ul id="trends-list"></ul>
				</div>
				<div>
					<h2>High Activity Days of the Month</h2>
					<ul id="special-day-list"></ul>
				</div>
				
			</div>

			{
			// when user is logged in, display that they are logged in. otherwise, nothing is displayed
			loggedUser ?
				<>
					<span>Hello, {loggedUser}! </span>
					<button type='button' onClick={logout}>Logout</button>
				</>
			:
				null
			}
		</>
	);
}
