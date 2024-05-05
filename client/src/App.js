import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useState } from 'react';
import { DateTimeProvider } from './components/commonDate';

import PageA from './pages/PageA';
import PageB from './pages/PageB';
import PageC from './pages/PageC';
import PageD from './pages/PageD';

export default function App() {
	return (
		<BrowserRouter>
			<DateTimeProvider> {}
				<Routes>
					<Route path='/' element={<PageA />} />
					<Route path='/a' element={<PageA />} />
					<Route path='/b' element={<PageB />} />
					<Route path='/c' element={<PageC />} />
					<Route path='/d' element={<PageD />} />
				</Routes>
			</DateTimeProvider>
		</BrowserRouter>
	);
}

/*
export default function App() {
	const [testGuy, setTestGuy] = useState(0);

	const handleSet = (val) => {
		setTestGuy(val);
	}

	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<PageA tested={testGuy} tester={handleSet} />} />
				<Route path='/a' element={<PageA tested={testGuy} tester={handleSet} />} />
				<Route path='/b' element={<PageB tested={testGuy} tester={handleSet} />} />
				<Route path='/c' element={<PageC tested={testGuy} tester={handleSet} />} />
				<Route path='/d' element={<PageD />} />
			</Routes>
		</BrowserRouter>
	);
}
*/