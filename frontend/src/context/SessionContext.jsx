import { createContext, useContext, useEffect, useState } from 'react';
import { getCourse, getCourses } from '../services/coursesServices';
import { getUser, getUsers } from '../services/usersServices';

const SessionContext = createContext();

export default function SessionProvider({ children }) {
    const [loadedCourses, setLoadedCourses] = useState([]);
    const [loadedUsers, setLoadedUsers] = useState([]);
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (error) alert(JSON.stringify(error));
    }, [error]);

    const loadCourses = async () => {
        const res = await getCourses();
        if (res.success) {
            setLoadedCourses(res.data);
            return res.data;
        } else {
            setError(res.error || 'Something went wrong while fetching courses.');
            return [];
        }
    }

    const loadUsers = async () => {
        const res = await getUsers();
        if (res.success) {
            setLoadedUsers(res.data);
            return res.data;
        } else {
            setError(res.error || 'Something went wrong while fetching users.');
            return [];
        }
    }

    const reloadCourse = async (courseId) => {
        const res = await getCourse(courseId);
        if (res.success) {
            const reloadedCourse = res.data;
            setLoadedCourses(prev => [
                ...prev.filter(el => el.id !== courseId),
                reloadedCourse,
            ]);
        } else {
            setError(res.error || 'Something went wrong while reloading course.');
        }
    };

    const reloadUser = async (userId) => {
        const res = await getUser(userId);
        if (res.success) {
            const reloadedUser = res.data;
            console.log('reloadedUser', reloadedUser);
            setLoadedUsers(prev => [
                ...prev.filter(el => el.id !== userId),
                reloadedUser,
            ]);
        } else {
            setError(res.error || 'Something went wrong while reloading course.');
        }
    }

    const contextValue = {
        loadedCourses, loadedUsers,
        loadCourses, loadUsers,
        reloadCourse, reloadUser,
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
