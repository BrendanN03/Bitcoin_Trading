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
	}, []);

	const logout = (e) => {
		console.log('logout pressed but it does not do anything yet');
	}

	return (
		<>
			<div className="headerContainer">
				<Link to='/a' className="buttonLink">Page A</Link>
				<Link to='/b' className="buttonLink">Page B</Link>
				<Link to='/c' className="buttonLink">Page C</Link>
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
