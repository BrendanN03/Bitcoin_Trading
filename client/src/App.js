import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { DateTimeProvider } from './components/commonDate';

import GamePage from './pages/GamePage';
import AnalyticsPage from './pages/AnalyticsPage';
import HistoricalDataPage from './pages/HistoricalDataPage';
import PastTransactionsPage from './pages/PastTransactionsPage';

export default function App() {
	return (
		<BrowserRouter>
			<DateTimeProvider> {}
				<Routes>
					<Route path='/' element={<GamePage />} />
					<Route path='/game' element={<GamePage />} />
					<Route path='/analytics' element={<AnalyticsPage/>} />
					<Route path='/historical_data' element={<HistoricalDataPage />} />
					<Route path='/past_transactions' element={<PastTransactionsPage />} />
				</Routes>
			</DateTimeProvider>
		</BrowserRouter>
	);
}
