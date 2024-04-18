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

	}, []);

	const logout = (e) => {
		console.log('logout pressed but it does not do anything yet');
	}

	return (
		<>
			<Link to='/a'>go to page a</Link><br />

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