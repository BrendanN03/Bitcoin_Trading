import  '../styles.css';
import React, { useContext } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateTimeContext } from '../components/commonDate';

const config = require('../config.json');

export default function PageC() {
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
			
			fetch(`http://${config.server_host}:${config.server_port}/monthly_summary`)
				.then(res => res.json())
				.then(resJson => {
					const listContainer = document.getElementById('monthly-summary-list');
					if (listContainer) {
						listContainer.innerHTML = '';
					}
					resJson.forEach(summary => {
						if (summary.month < currentDateTime.toISOString().replace('T', ' ').replace('Z', '')) {
							const listItem = document.createElement('li');
							listItem.textContent = `Month: ${summary.month}, AVG_OPEN: ${summary.avg_open}, AVG_CLOSE: ${summary.avg_close}, text: ${summary.tweet_text}`;
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
			// when user is logged in, display that they are logged in. otherwise, nothing is displayed
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

// #tweet-list {//
//     list-style-type: none; /* Remove default list styling */
//     padding: 0; /* Remove default padding */
// }
// #special-day-list {//
//     list-style-type: none; /* Remove default list styling */
//     padding: 0; /* Remove default padding */
//     height: 1%;
// }
// #monthly-summary-list {
//     list-style-type: none; /* Remove default list styling */
//     padding: 0; /* Remove default padding */
//     height: 1%;
// }
// #trends-list {//
//     list-style-type: none; /* Remove default list styling */
//     padding: 0; /* Remove default padding */
//     height: 1%;
// }
// #top-weeks-list {
//     list-style-type: none; /* Remove default list styling */
//     padding: 0; /* Remove default padding */
//     height: 1%;
// }
