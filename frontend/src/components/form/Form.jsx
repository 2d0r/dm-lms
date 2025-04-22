import { useState } from 'react';
import api from '../../api';
import { useNavigate } from 'react-router-dom';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../../constants';
import './Form.css';
import { useSession } from '../../context/SessionContext';

export default function Form({ route, method }) {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [fullName, setFullName] = useState('');
    const [role, setRole] = useState('role');
    const navigate = useNavigate();
    const { setUserState, setError, setLoading } = useSession();

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
                setUserState(prev => ({
                    ...prev,
                    role: res.data.role,
                    id: res.data.id,
                    name: res.data.first_name,
                }));
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                localStorage.setItem(REFRESH_TOKEN, res.data.refresh);
                localStorage.setItem('userId', res.data.id);

                // Navigate based on role
                switch (res.data.role) {
                    case 'STUDENT':
                        navigate('/');
                        break;
                    case 'TEACHER':
                        navigate('/');
                        break;
                    case 'ADMIN':
                        navigate('/manage-courses');
                        break;
                    default:
                        navigate('/');
                        break;
                }
            } else if (method === 'register') {
                const res = await api.post(route, {
                    username,
                    password,
                    first_name: fullName,
                    profile: { role: role.toUpperCase() }
                });
                if (!res.success) {
                    setError(res.error || 'Something went wrong while registering user.');
                }
                navigate('/login');
            }
        } catch (error) {
            setError(error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRole = (e) => {
        e.preventDefault();
        setRole(e.target.value);
    }

    return (
        <form onSubmit={handleSubmit} className='form-container'>
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
            <div className='buttons'>
                <button className='submit-button' type='submit'>
                    {submitLabel}
                </button>
                {method === 'login' ? (
                    <button
                        className='redirect-button'
                        type='button'
                        onClick={() => navigate('/register')}
                    >
                        Sign up
                    </button>
                ) : (
                    <button
                        className='redirect-button'
                        type='button'
                        onClick={() => navigate('/login')}
                    >
                        Login
                    </button>
                )}
            </div>
        </form>
    );
}
