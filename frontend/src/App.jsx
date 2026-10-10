import './App.css'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Dashboard from './pages/dashboard';
import LoginPage from './pages/loginPage';
import UsersPage from './pages/usersPage';
import AccountPage from './pages/AccountPage';
import ReportPage from './pages/reportPage';
import JournalsPage from './pages/journalsPage';
import SettingsPage from './pages/settingsPage';
import ProtectedRoute from './components/protectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes wrapped in Layout with Aside Sidebar */}
        <Route element={<ProtectedRoute allowedRoles={['administrator', 'admin', 'teller', 'supervisor']} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route element={<ProtectedRoute allowedRoles={['administrator', 'admin']}/>}>
              <Route path="/users" element={<UsersPage />} />
              <Route path="/accounts" element={<AccountPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="/reports" element={<ReportPage />} />
            <Route path="/journals" element={<JournalsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
