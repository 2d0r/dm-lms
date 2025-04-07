import { useEffect, useState } from 'react';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';

export default function Form({ route, method }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('role');
    const navigate = useNavigate();

    const title = method === 'login' ? 'Login' : 'Register';
    const submitLabel = title;

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        try {
            if (method === 'login') {
                const res = await api.post(route, {
                    username,
                    password,
                });
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                localStorage.setItem('role', res.data.role); // save role in local
                navigate('/');
            } else if (method === 'register') {
                const res = await api.post(route, {
                    username,
                    password,
                    first_name: fullName,
                    profile: { role: role.toUpperCase() }
                });
                navigate('/login');
            }
        } catch (error) {
            alert(error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit} className='form-container'>
            <h1>{title}</h1>
            <input
                className='form-input'
                type='text'
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder='Username'
            />
            <input
                className='form-input'
                type='password'
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder='Password'
            />
            {method === 'register' && (
                <>
                    <input
                        className='form-input'
                        type='text'
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder='Full Name'
                    />
                    <select
                        name='role'
                        id='role'
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                    >
                        <option value='role' disabled>
                            Role
                        </option>
                        <option value='student'>Student</option>
                        <option value='teacher'>Teacher</option>
                    </select>
                </>
            )}
            <button className='form-button' type='submit'>
                {submitLabel}
            </button>
            {method === 'login' ? (
                <button
                    className='link-button'
                    type='button'
                    onClick={() => navigate('/register')}
                >
                    Sign up
                </button>
            ) : (
                <button
                    className='link-button'
                    type='button'
                    onClick={() => navigate('/login')}
                >
                    Login
                </button>
            )}
        </form>
    );
}
