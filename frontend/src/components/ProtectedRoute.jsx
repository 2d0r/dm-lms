import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { useSession } from '../context/SessionContext';
import { ACCESS_TOKEN } from '../constants';

export default function ProtectedRoute({ children, authorisedRole = 'STUDENT' }) {
    // Check someone is authorised before allowing them to access this route
    // Otherwise redirect or notify
    const [isAuthorised, setIsAuthorised] = useState(null);
    const { userState } = useSession();

    // Run auth on load
    useEffect(() => {
        auth().catch(() => setIsAuthorised(false));
    }, []);

    useEffect(() => {
        const token = localStorage.getItem(ACCESS_TOKEN);

        if (!token) {
            setIsAuthorised(false);
            return;
        }

        if (!userState || !userState.role) {
            // Still loading user, wait.
            return;
        }

        checkAuthByRole();
    }, [userState.role]);

    const auth = async () => {
        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setIsAuthorised(false);
            return;
        }

        setIsAuthorised(true);
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

    return isAuthorised ? children : <Navigate to='/login' />;
}
