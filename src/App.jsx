import { Routes, Route } from 'react-router-dom';
import { PageWrapper } from './components/layout/PageWrapper';
import { HomePage } from './pages/HomePage';
import { StrategyPage } from './pages/StrategyPage';

function App() {
  return (
    <PageWrapper>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/strategy/:strategyId" element={<StrategyPage />} />
        <Route path="/strategy/:strategyId/:type/:itemId" element={<StrategyPage />} />
      </Routes>
    </PageWrapper>
  );
}

export default App;
