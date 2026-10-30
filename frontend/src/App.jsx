import './App.css'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Dashboard from './pages/dashboard';
import LoginPage from './pages/loginPage';
import UsersPage from './pages//users/usersPage';
import AccountPage from './pages/customers/customerPage';
import ReportPage from './pages/reportPage';
import JournalsPage from './pages/journalsPage';
import SettingsPage from './pages/settingsPage';
import ProtectedRoute from './components/protectedRoute';
import Layout from './components/Layout';
import NotFound from './pages/errors/404'; 
import UserFormPage from './pages/users/userFormPage';
import CustomerFormPage from './pages/customers/customerFormPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/404' element={<NotFound/>}/>
        <Route path="/login" element={<LoginPage />} />

        {/* Protected routes wrapped in Layout with Aside Sidebar */}
        <Route element={<ProtectedRoute allowedRoles={['administrator', 'admin', 'teller', 'supervisor']} />}>
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route element={<ProtectedRoute allowedRoles={['administrator', 'admin']}/>}>
              <Route path="/users" element={<UsersPage />} />
              <Route path='/user/add' element={ <UserFormPage/> }/>
              <Route path={"/user/:user_id/edit"} element={<UserFormPage/>}/>
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
            <Route path="/accounts" element={<AccountPage />} />
            <Route path="/account/add" element={<CustomerFormPage />} />
            <Route path="/account/:customer_id/edit" element={<CustomerFormPage />} />
            <Route path="/reports" element={<ReportPage />} />
            <Route path="/journals" element={<JournalsPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
