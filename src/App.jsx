import { Routes, Route } from 'react-router-dom';
import { PageWrapper } from './components/layout/PageWrapper';
import { HomePage } from './pages/HomePage';
import { StrategyPage } from './pages/StrategyPage';
import { LoginPage } from './pages/LoginPage';
import { SignupPage } from './pages/SignupPage';
import { DashboardPage } from './pages/DashboardPage';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/" element={<ProtectedRoute><PageWrapper><HomePage /></PageWrapper></ProtectedRoute>} />
      <Route path="/strategy/:strategyId" element={<ProtectedRoute><PageWrapper><StrategyPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/strategy/:strategyId/:type/:itemId" element={<ProtectedRoute><PageWrapper><StrategyPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><DashboardPage /></PageWrapper></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
