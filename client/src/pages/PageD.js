import  '../styles.css';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const config = require('../config.json');

export default function PageD() {
	const [loggedUser, setLoggedUser] = useState(null);
	const [currentUSD, setCurrentUSD] = useState(0);
	const [currentBTC, setCurrentBTC] = useState(0);

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
				<Link to='/a' className="buttonLink">Page A</Link>
				<Link to='/b' className="buttonLink">Page B</Link>
				<Link to='/c' className="buttonLink">Page C</Link>
				<Link to='/d' className="buttonLink">Page D</Link>
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
