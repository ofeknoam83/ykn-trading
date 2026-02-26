import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Dashboard } from './pages/Dashboard';
import { Backtest } from './pages/Backtest';
import { Agents } from './pages/Agents';
import { Chart } from './pages/Chart';
import { LLMExperts } from './pages/LLMExperts';
import { Strategies } from './pages/Strategies';
import { PortfolioOperationsCenter } from './components/portfolio/PortfolioOperationsCenter';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="chart/:symbol" element={<Chart />} />
          <Route path="backtest" element={<Backtest />} />
          <Route path="strategies" element={<Strategies />} />
          <Route path="agents" element={<Agents />} />
          <Route path="llm" element={<LLMExperts />} />
          <Route path="portfolio" element={<PortfolioOperationsCenter />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
