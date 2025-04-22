import { Navigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import api from '../api';
import { REFRESH_TOKEN, ACCESS_TOKEN } from '../constants';
import { useState, useEffect } from 'react';
import { useSession } from '../context/SessionContext';

export default function ProtectedRoute({ children, authorisedRole = 'STUDENT' }) {
    // Check someone is authorised before allowing them to access this route
    // Otherwise redirect or notify
    const [isAuthorised, setIsAuthorised] = useState(null);
    const { userState } = useSession();

    // Run auth on load
    useEffect(() => {
        auth().catch(() => setIsAuthorised(false));
        checkAuthByRole();
    }, []);

    const refreshToken = async () => {
        // Send request to backend with refresh token to get new access token
        const refreshToken = localStorage.getItem(REFRESH_TOKEN);
        try {
            const response = await api.post('/api/token/refresh/', {
                refresh: refreshToken,
            });
            if (response.status === 200) {
                localStorage.setItem(ACCESS_TOKEN, response.data.access);
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

    const checkAuthByRole = () => {
        if (authorisedRole === 'STUDENT') {
            setIsAuthorised(true);
        } else if (authorisedRole === 'TEACHER' && ['TEACHER', 'ADMIN'].includes(userState.role)) {
            setIsAuthorised(true);
        } else if (authorisedRole === 'ADMIN' && userState.role === 'ADMIN') { 
            setIsAuthorised(true);
        } else {
            setIsAuthorised(false);
        }
    }

    if (isAuthorised === null) {
        return <div>Loading...</div>;
    }

    return isAuthorised ? children : <Navigate to="/login" />;
}
