import  '../styles.css';
import React, { useContext } from 'react';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { DateTimeContext } from '../components/commonDate';

const config = require('../config.json');

export default function PageD() {
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
		
		fetch(`http://${config.server_host}:${config.server_port}/total_holdings/${currentDateTime.toISOString().replace('T', '%').replace('Z', '')}`)
			.then(res => res.json())
			.then(resJson => {
				const listContainer = document.getElementById('holdings-list');
				if (listContainer) {
					listContainer.innerHTML = '';
				}
				resJson.forEach(trans => {
					const listItem = document.createElement('li');
					listItem.textContent = `Player ${trans.id}: $${trans.total_usd_holdings}`;
					if (listContainer) {
						listContainer.appendChild(listItem);
					}
				});
			});
	}, []);

	useEffect(() => {
		if (loggedUser) {
			fetch(`http://${config.server_host}:${config.server_port}/total_traded/${loggedUser}`)
			.then(res => res.json())
			.then(resJson => {
				const listContainer = document.getElementById('traded-list');
				if (listContainer) {
					listContainer.innerHTML = '';
				}
				resJson.forEach(trans => {
					const listItem = document.createElement('li');
					listItem.textContent = `Total ${trans.transaction_type}: $${trans.total_traded.toFixed(2)}`;
					if (listContainer) {
						listContainer.appendChild(listItem);
					}
				});
			});
		} else {
			const listContainer = document.getElementById('traded-list');
			if (listContainer) {
				listContainer.innerHTML = '';
			}
			const listItem = document.createElement('li');
			listItem.textContent = `No user logged in`;
			if (listContainer) {
				listContainer.appendChild(listItem);
			}
		}
		
	}, [loggedUser]);

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
				<div style={{ fontWeight: 'bold', fontSize: '18px', margin: '10px 0' }}>Crypto Conquest</div>
				<Link to='/game' className="buttonLink">Game</Link>
				<Link to='/analytics' className="buttonLink">Analytics</Link>
				<Link to='/historical_data' className="buttonLink">Historical Data</Link>
				<Link to='/past_transactions' className="buttonLink">Past Transactions</Link>
			</div>

			<div className="bars-container">
				<div>
					<h2>Overall Players' Holdings</h2>
					<ul id="holdings-list">
					</ul>
				</div>
				<div>
					<h2>Curent Player's Totals</h2>
					<ul id="traded-list">
					</ul>
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
