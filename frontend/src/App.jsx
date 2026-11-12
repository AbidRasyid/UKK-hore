import './App.css'
import { BrowserRouter, Routes, Route, useNavigate } from 'react-router-dom'
import { useEffect } from 'react';
import Dashboard from './pages/dashboard';
import LoginPage from './pages/loginPage';
import UsersPage from './pages//users/usersPage';
import Reports from './pages/reports';
import JournalsPage from './pages/journalsPage';
import PinRequestsPage from './pages/users/pinRequestsPage';

import ProtectedRoute from './components/protectedRoute';
import Layout from './components/Layout';
import NotFound from './pages/errors/404';

import UserFormPage from './pages/users/userFormPage';
import UserBulkCreatePage from './pages/users/userBulkCreatePage';
import CustomerFormPage from './pages/customers/customerFormPage';
import CustomerTransactionPage from './pages/customers/customerTransactionPage';
import ReportDetail from './pages/reports/reportDetail';
import DailyReportFormPage from './pages/reports/dailyReportFormPage';
import ResetPasswordPage from './pages/resetPasswordPage';
import ForgotPasswordPage from './pages/forgotPasswordPage';
import CustomerPage from './pages/customers/customerPage';
import TellerTransactionsPage from './pages/transactions/tellerTransactionsPage';
import SupervisorTransactionsPage from './pages/transactions/supervisorTransactionsPage';

function AuthRedirectHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const handleUnauthorized = () => navigate('/login', { replace: true });
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [navigate]);

  return null;
}

function App() {
  return (
    <BrowserRouter>
      <AuthRedirectHandler />
      <Routes>
        <Route path='/404' element={<NotFound/>}/>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />

        {/* Protected routes wrapped in Layout with Aside Sidebar */}
        <Route element={<ProtectedRoute allowedRoles={['administrator', 'admin', 'teller', 'supervisor']} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            
            <Route element={<ProtectedRoute allowedRoles={['administrator', 'admin']}/>}>
              <Route path="/accounts" element={<CustomerPage />} />
              <Route path="/users" element={<UsersPage />} />
              <Route path="/users/bulk" element={<UserBulkCreatePage />} />
              <Route path='/user/add' element={ <UserFormPage/> }/>
              <Route path={"/user/:user_id/edit"} element={<UserFormPage/>}/>
              <Route path="/pin-requests" element={<PinRequestsPage />} />
              <Route path="/account/add" element={<CustomerFormPage />} />
              <Route path="/account/:customer_id/edit" element={<CustomerFormPage />} />

            </Route>

            <Route element={<ProtectedRoute allowedRoles={['administrator', 'admin', 'supervisor']}/> }>
              <Route path="/journals" element={<JournalsPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['supervisor']}/> }>
              <Route path="/supervisor/transactions" element={<SupervisorTransactionsPage />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['teller']}/>}>
              <Route path="/transactions" element={<TellerTransactionsPage />} />
              <Route path="/account/:customer_id/transactions" element={<CustomerTransactionPage />} />
            </Route>

            <Route element={<ProtectedRoute allowedRoles={['supervisor', 'teller']}/>}>
              <Route path="/report/:report_id" element={<ReportDetail />} />
              <Route path="/reports" element={<Reports />} />
            </Route>
            
            <Route element={<ProtectedRoute allowedRoles={['teller']}/>}>
              <Route path="/reports/create" element={<DailyReportFormPage />} />
            </Route>
            
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
