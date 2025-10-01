import './App.css';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import FindAccountPage from './pages/FindAccountPage';
import ResetPasswordPage from './pages/ResetPasswordPage';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/approvalwrite" element={<DashboardPage />} />
        <Route path="/approval-detail" element={<DashboardPage />} />
        <Route path="/progress-list" element={<DashboardPage />} />
        <Route path="/member-management" element={<DashboardPage />} />
        <Route path="/organization-management" element={<DashboardPage />} />
        <Route path="/form-management" element={<DashboardPage />} />
        <Route path="/draft/create" element={<DashboardPage />} />
        <Route path="/find-account" element={<FindAccountPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
      </Routes>
    </Router>
  );
}

export default App;
