import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const LoginPage = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [errorMsg, setErrorMsg] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setErrorMsg('');

        try{
            const response = await axios.post('http://127.0.0.1:8000/api/login', {
                username, password,
            });

            const {token, user} = response.data;

            localStorage.setItem('token', token);
            localStorage.setItem('user', JSON.stringify(user));
            navigate('/dashboard');
        } catch (error) {
            setErrorMsg( error.response?.data?.message || 'Invalid username or password');
        }
    }

        return (
            <>
            <h1>E-Teller Bank Mini</h1>
            <form onSubmit={handleLogin}>
                <div>
                    <label>Username</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="Enter your username"
                        required
                    />
                </div>
                <div>
                    <label>Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="********"
                        required
                    />
                </div>
                {errorMsg && <p style={{ color: 'red' }}>{errorMsg}</p>}
                <button type="submit">Login</button>
            </form>
            </>
        )
    }
export default LoginPage;