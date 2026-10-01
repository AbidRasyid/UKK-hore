import './App.css'
import { BrowserRouter, Routes, Route} from 'react-router-dom'
import Dashboard from './pages/dashboard';
import LoginPage from './pages/loginPage';

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path='/login' element={<LoginPage />} />
        <Route path="/" element={<Dashboard />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
