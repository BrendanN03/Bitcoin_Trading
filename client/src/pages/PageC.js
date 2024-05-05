import  '../styles.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const config = require('../config.json');

export default function PageC() {
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
			
			fetch(`http://${config.server_host}:${config.server_port}/monthly_summary`)
				.then(res => res.json())
				.then(resJson => {
					const listContainer = document.getElementById('monthly-summary-list');
					if (listContainer) {
						listContainer.innerHTML = '';
					}
					resJson.forEach(summary => {
						if (summary.month < zzz_datetime) {
							const listItem = document.createElement('li');
							listItem.textContent = `Month: ${summary.month}, AVG_OPEN: ${summary.avg_open}, AVG_CLOSE: ${summary.avg_close}`;
							if (listContainer) {
								listContainer.appendChild(listItem);
							}
						}
					});
				});

			fetch(`http://${config.server_host}:${config.server_port}/top_weeks`)
				.then(res => res.json())
				.then(resJson => {
					const listContainer = document.getElementById('top-weeks-list');
					if (listContainer) {
						listContainer.innerHTML = '';
					}
					resJson.slice(0, 6).forEach(week => { 
						const listItem = document.createElement('li');
						listItem.textContent = `Year: ${week.year}, Week: ${week.week}, Difference: ${week.difference}, Tweet: ${week.tweet_text}`;
						if (listContainer) {
							listContainer.appendChild(listItem);
						}
					});
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
					<h2>Monthly Summaries</h2>
					<ul id="monthly-summary-list"></ul>
				</div>
				<div>
					<h2>Tweets From Volatile Weeks</h2>
					<ul id="top-weeks-list"></ul>
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
