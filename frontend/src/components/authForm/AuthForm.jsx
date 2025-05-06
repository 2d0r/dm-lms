
import React, { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../constants';
import './AuthForm.css';
import { useSession } from '../../context/SessionContext';
import LoadingAnimation from '../loadingAnimation/LoadingAnimation';

export default function AuthForm({ route, method }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('role');
    const [message, setMessage] = useState('');
    const navigate = useNavigate();
    const { setUserState, setError, setLoading, loading } = useSession();

    const title = method === 'login' ? 'Login' : 'Register';
    const submitLabel = title;

    const handleSubmit = async (e) => {
        setLoading(true);
        e.preventDefault();

        if (method === 'login') {
            try {
                const response = await api.post(route, {
                    username,
                    password,
                });

                setUserState(prev => ({
                    ...prev,
                    role: response.data.role,
                    id: response.data.id,
                    name: response.data.first_name,
                }));
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
                localStorage.setItem(REFRESH_TOKEN, response.data.refresh);

                // Redirect based on role
                if (response.data.role === 'ADMIN') {
                    navigate('/manage-courses');
                } else {
                    navigate('/');
                }
            } catch (error) {
                console.error('Login error', error);
                setMessage('Username or password is incorrect. Please try again.');
            }
        } else if (method === 'register') {
            try {
                await api.post(route, {
                    username,
                    password,
                    first_name: fullName,
                    profile: { role: role.toUpperCase() }
                });
                navigate('/login');
            } catch (error) {
                setError(error);
                console.error(error);
            }
        }
        setLoading(false);
    };

    const handleSelectRole = (e) => {
        e.preventDefault();
        setRole(e.target.value);
    }

    return (
        <section className='form-overlay'>
            <div className='form-container'>
                <div className='hero'>
                    <span className='over-title'>Welcome to </span>
                    The D&M Academy
                </div>
                <form onSubmit={handleSubmit} id='auth-form' className='fade-in'>
                    <div className='title'>{title}</div>
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
                                className='form-input custom-select'
                                name='role'
                                id='role'
                                value={role}
                                onChange={handleSelectRole}
                            >
                                <option value='role' disabled>
                                    Role
                                </option>
                                <option value='student'>Student</option>
                                <option value='teacher'>Teacher</option>
                            </select>
                        </>
                    )}
                    {message && (
                        <div className='message'>{message}</div>
                    )}
                    <div className='buttons'>
                        <button className='submit-button' type='submit'>
                            {loading ? <LoadingAnimation inline={true} /> : submitLabel}
                        </button>
                        {method === 'login' ? (
                            <button
                                className='redirect-button'
                                type='button'
                                onClick={() => navigate('/register')}
                            >
                                Sign Up
                            </button>
                        ) : (
                            <button
                                className='redirect-button'
                                type='button' name='login'
                                onClick={() => navigate('/login')}
                            >
                                Login
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </section>
    );
}
