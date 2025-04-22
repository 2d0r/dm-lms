import { createContext, useContext, useEffect, useState } from 'react';
import { getCourse, getCourses, getUserCourses } from '../services/coursesServices';
import { getUser, getUsers } from '../services/usersServices';

const SessionContext = createContext();

const DEFAULT_USER_STATE = {
    id: '',
    access: '',
    refresh: '',
    role: '',
    name: '',
}

export default function SessionProvider({ children }) {
    const [loadedCourses, setLoadedCourses] = useState([]);
    const [loadedUsers, setLoadedUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [userState, setUserState] = useState(DEFAULT_USER_STATE);

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
        const result = await getUser(userId);
        if (result.success) {
            const reloadedUser = result.data;
            console.log('reloadedUser', reloadedUser);
            setLoadedUsers(prev => [
                ...prev.filter(el => el.id !== userId),
                reloadedUser,
            ]);
        } else {
            setError(result.error || 'Something went wrong while reloading course.');
        }
    }

    const contextValue = {
        loadedCourses, loadCourses, reloadCourse,
        loadedUsers, loadUsers, reloadUser,
        userState, setUserState,
        loadUserCourses,
        setError, setLoading
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
