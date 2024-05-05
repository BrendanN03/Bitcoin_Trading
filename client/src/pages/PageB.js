import  '../styles.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const config = require('../config.json');

export default function PageB() {
	const [loggedUser, setLoggedUser] = useState(null);

	useEffect(() => {
		fetch(`http://${config.server_host}:${config.server_port}/session`, { credentials: 'include' })
			.then(res => {
				if (res.status !== 200) {
					return Promise.reject(res);
				}

				return res.json();
			})
			.then(resJson => setLoggedUser(resJson.user), _ => {});
		
			const zzz_datetime = '2021-11-26%2023:59:00'; // TODO: get a better name or a real source for datetime
			const month = '2021-11'; 
			fetch(`http://${config.server_host}:${config.server_port}/day_tweets/${zzz_datetime}`)
				.then(res => res.json()) // TODO: may handle status code 500
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

			fetch(`http://${config.server_host}:${config.server_port}/trends`)
				.then(res => res.json())
				.then(resJson => {
					const listContainer = document.getElementById('trends-list');
					if (listContainer) {
						listContainer.innerHTML = '';
					}
					resJson.slice(0, 6).forEach(trend => {
						const listItem = document.createElement('li');
						listItem.textContent = `Hour: ${trend.hour}, Hourly Price Change: ${trend.hourly_price_change}, Prediction Up: ${trend.pred_up}, Prediction Down: ${trend.pred_down}, Total Trading Volume: ${trend.total_trading_volume}`;
						if (listContainer) {
							listContainer.appendChild(listItem);
						}
					});
				});

			fetch(`http://${config.server_host}:${config.server_port}/special_days/${month}`)
				.then(res => res.json())
				.then(resJson => {
					const listContainer = document.getElementById('special-day-list'); // Update this ID accordingly
					if (listContainer) {
						listContainer.innerHTML = '';
					}
					resJson.forEach(specialDay => {
						if (specialDay.tweet_count > 0 && specialDay.special_days < zzz_datetime) {
							const listItem = document.createElement('li');
							listItem.textContent = `${specialDay.special_days}, AVG_CLOSE: ${specialDay.avg_close}, TWEET_COUNT: ${specialDay.tweet_count}`;
							if (listContainer) {
								listContainer.appendChild(listItem);
							}
						}
					})
				});

			
	}, []);

	const logout = (e) => {
		console.log('logout pressed but it does not do anything yet');
	}

	return (
		<>
			<div className="headerContainer">
				<Link to='/a' className="buttonLink">Game</Link>
				<Link to='/b' className="buttonLink">Analytics</Link>
				<Link to='/c' className="buttonLink">Historical Data</Link>
			</div>

			<div className="bars-container">
				<div>
					<h2>Tweets of the Day</h2>
					<ul id="tweet-list"></ul>
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
