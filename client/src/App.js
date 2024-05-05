import { BrowserRouter, Routes, Route } from "react-router-dom";

import PageA from './pages/PageA';
import PageB from './pages/PageB';
import PageC from './pages/PageC';
import PageD from './pages/PageD';

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<PageA />} />
				<Route path='/a' element={<PageA />} />
				<Route path='/b' element={<PageB />} />
				<Route path='/c' element={<PageC />} />
				<Route path='/d' element={<PageD />} />
			</Routes>
		</BrowserRouter>
	);
}