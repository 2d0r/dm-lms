import { useSession } from '../context/SessionContext'

export const useGetUserDisplayData = () => {
    const { loadedCourses, setError } = useSession();

    return (user, relatedCourses = []) => {
        const courses = relatedCourses.length ? relatedCourses : loadedCourses;

        if (courses.length === 0) {
            setError('Failed to get course display info. Users should be loaded before this operation.')
            return { ...user, courseNames: [] };
        }
        return {
            ...user,
            courseNames: courses.map(course => course.title),
        };
    }
}