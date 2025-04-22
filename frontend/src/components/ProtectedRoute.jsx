import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
import { REFRESH_TOKEN, ACCESS_TOKEN } from '../constants';
import { useState, useEffect } from 'react';

export default function ProtectedRoute({ children }) {
    // Check someone is authorised before allowing them to access this route
    // Otherwise redirect or notify
    const [isAuthorised, setIsAuthorised] = useState(null);

    // Run auth on load
    useEffect(() => {
        auth().catch(() => setIsAuthorised(false));
    }, []);

    const refreshToken = async () => {
        // Send request to backend with refresh token to get new access token
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const res = await api.post('/api/token/refresh/', {
                refresh: refreshToken,
            });
            if (res.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, res.data.access);
                setIsAuthorised(true);
            } else {
                setIsAuthorised(false);
            }
        } catch (error) {
            console.error(error);
            setIsAuthorised(false);
        }
    };

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorised(false);
            return;
        }
        const decoded = jwtDecode(token);

        //  Check whether token has expired
        const tokenExpiration = decoded.exp;
        const now = Date.now() / 1000; // in seconds
        if (tokenExpiration < now) {
            await refreshToken();
        } else {
            setIsAuthorised(true);
        }
    };

    if (isAuthorised === null) {
        return <div>Loading...</div>;
    }

    return isAuthorised ? children : <Navigate to="/login" />;
}
