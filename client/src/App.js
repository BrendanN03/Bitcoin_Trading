import { BrowserRouter, Routes, Route } from "react-router-dom";

import PageA from './pages/PageA';
import PageB from './pages/PageB';

export default function App() {
	return (
		<BrowserRouter>
			<Routes>
				<Route path='/' element={<PageA />} />
				<Route path='/a' element={<PageA />} />
				<Route path='/b' element={<PageB />} />
			</Routes>
		</BrowserRouter>
	);
}