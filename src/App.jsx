import { Routes, Route } from 'react-router-dom';
import { PageWrapper } from './components/layout/PageWrapper';
import { HomePage } from './pages/HomePage';
import { StrategyPage } from './pages/StrategyPage';
import { LoginPage } from './pages/LoginPage';
import { AcceptInvitePage } from './pages/AcceptInvitePage';
import { DashboardPage } from './pages/DashboardPage';
import { UsersPage } from './pages/UsersPage';
import { ToolsPage } from './pages/ToolsPage';
import { ToolMappingPage } from './pages/ToolMappingPage';
import { ToolOwnersPage } from './pages/ToolOwnersPage';
import { EvidencePage } from './pages/EvidencePage';
import { ControlsPage } from './pages/ControlsPage';
import { ProtectedRoute } from './components/shared/ProtectedRoute';

function App() {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/accept-invite/:token" element={<AcceptInvitePage />} />

      {/* Protected routes */}
      <Route path="/" element={<ProtectedRoute><PageWrapper><HomePage /></PageWrapper></ProtectedRoute>} />
      <Route path="/strategy/:strategyId" element={<ProtectedRoute><PageWrapper><StrategyPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/strategy/:strategyId/:type/:itemId" element={<ProtectedRoute><PageWrapper><StrategyPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/dashboard" element={<ProtectedRoute><PageWrapper><DashboardPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/evidence" element={<ProtectedRoute><PageWrapper><EvidencePage /></PageWrapper></ProtectedRoute>} />
      <Route path="/controls" element={<ProtectedRoute><PageWrapper><ControlsPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/controls/:itemId" element={<ProtectedRoute><PageWrapper><ControlsPage /></PageWrapper></ProtectedRoute>} />

      {/* Admin-only pages (access enforcement done inside each page) */}
      <Route path="/users" element={<ProtectedRoute><PageWrapper><UsersPage /></PageWrapper></ProtectedRoute>} />
      
      {/* Phase 3 Tools Module */}
      <Route path="/tools" element={<ProtectedRoute><PageWrapper><ToolsPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/tool-mapping" element={<ProtectedRoute><PageWrapper><ToolMappingPage /></PageWrapper></ProtectedRoute>} />
      <Route path="/tool-owners" element={<ProtectedRoute><PageWrapper><ToolOwnersPage /></PageWrapper></ProtectedRoute>} />
    </Routes>
  );
}

export default App;
