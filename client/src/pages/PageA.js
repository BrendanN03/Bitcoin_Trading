import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

const config = require('../config.json');

export default function PageA() {
	const [loggedUser, setLoggedUser] = useState(null);

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
			.then(resJson => setLoggedUser(resJson.user), _ => {});

	}, []);

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
					// window.location.reload();
				} else {
					console.log('loginSubmit: what happened here');
					throw new Error('what happen');
				}
			})
		
	}

	// handle account logout
	const logout = (e) => {
		console.log('logout pressed but it does not do anything yet');
	}

	return (
		<>
			<Link to='/b'>go to page b</Link>

			{/* register and submit might as well go on a separate page */}
			<form onSubmit={registerSubmit}>
				<input id='register_username' type='text' name='username' placeholder='Username' minLength='5' maxLength='10' required />
				<input id='register_password' type='password' name='password' placeholder='Password' minLength='5' maxLength='15' required />
				<input id='register_password_confirm' type='password' name='password_confirm' placeholder='Confirm Password' minLength='5' maxLength='15' required />
				<button type='submit'>Register</button>
				<span id='register_msg' />
			</form>
			
			<form onSubmit={loginSubmit}>
				<input id='login_username' type='text' name='username' placeholder='Username' minLength='5' maxLength='10' required />
				<input id='login_password' type='password' name='password' placeholder='Password' minLength='5' maxLength='15' required />
				<button type='submit'>Login</button>
				<span id='login_msg' />
			</form>

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
