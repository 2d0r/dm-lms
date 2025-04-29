import { createContext, useContext, useEffect, useState } from 'react';
import { getCourse, getCourses } from '../services/coursesServices';
import { getUserCourses } from '../services/userCourseServices';
import { getUser, getUsers } from '../services/usersServices';
import { DEFAULT_SELECTION_MODAL_STATE, DEFAULT_USER_STATE } from '../lib/constants';
import { ACCESS_TOKEN, REFRESH_TOKEN } from '../constants';
import api from '../api';

const SessionContext = createContext();

export default function SessionProvider({ children }) {
    const [loadedCourses, setLoadedCourses] = useState([]);
    const [loadedUsers, setLoadedUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userState, setUserState] = useState(DEFAULT_USER_STATE);
    const [selectionModal, setSelectionModal] = useState(DEFAULT_SELECTION_MODAL_STATE);

    useEffect(() => {
        loadUserDetails();
    }, []);

    useEffect(() => {
        if (error) alert(JSON.stringify(error));
    }, [error]);

    const loadCourses = async () => {
        const result = await getCourses();
        if (result.success) {
            setLoadedCourses(result.data);
            return result.data;
        } else {
            setError(result.error || 'Something went wrong while fetching courses.');
            return [];
        }
    }

    const reloadCourse = async (courseId) => {
        const result = await getCourse(courseId);
        if (result.success) {
            const reloadedCourse = result.data;
            setLoadedCourses(prev => [
                ...prev.filter(el => el.id !== courseId),
                reloadedCourse,
            ]);
        } else {
            setError(result.error || 'Something went wrong while reloading course.');
        }
    };

    const loadUserCourses = async ({ userId, userRole }) => {
        const result = await getUserCourses({ userId, userRole });
        if (result.success) {
            setLoadedUsers(result.data);
            return result.data;
        } else {
            setError(result.error || 'Something went wrong while fetching courses for user.');
            return [];
        }
    }

    const loadUsers = async () => {
        const result = await getUsers();
        if (result.success) {
            setLoadedUsers(result.data);
            return result.data;
        } else {
            setError(result.error || 'Something went wrong while fetching users.');
            return [];
        }
    }

    const reloadUser = async (userId) => {
        try {
            const result = await getUser(userId);
            const reloadedUser = result.data;
            setLoadedUsers(prev => [
                ...prev.filter(el => el.id !== userId),
                reloadedUser,
            ]);
            return reloadedUser;
            // } else {
            //     setError(result.error || 'Something went wrong while reloading course.');
            //     return {};
            // }
        } catch (error) {
            console.error('Failed to fetch user:', error);
        }
        
    }    

    // Registration

    const loadUserDetails = async () => {

        const token = localStorage.getItem(ACCESS_TOKEN);
        if (!token) {
            setLoading(false); // no token, no user
            return;
        }

        try {
            const res = await api.get('/api/user/');
            const user = res.data;
            setUserState(prev => ({
                ...prev,
                role: user.profile.role,
                id: user.id,
                name: user.first_name,
            }));
        } catch (error) {
            console.error('Failed to fetch user:', error);
            // Optionally: logout user if refresh fails
        }
    }

    const contextValue = {
        loadedCourses, setLoadedCourses,
        loadCourses, reloadCourse,
        loadedUsers, loadUsers, reloadUser,
        userState, setUserState,
        loadUserCourses,
        selectionModal, setSelectionModal,
        error, setError, loading, setLoading
    };

    return (
        <SessionContext.Provider value={contextValue}>
            {children}
        </SessionContext.Provider>
    );
}

export const useSession = () => {
    const context = useContext(SessionContext);
    if (!context) {
        throw new Error('useSession must be used within a SessionProvider');
    }
    return context;
};
