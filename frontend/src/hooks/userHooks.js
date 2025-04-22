import { useSession } from '../context/SessionContext'

export const useGetUserDisplayData = () => {
    const { loadedCourses } = useSession();

    return (user, relatedCourses = []) => {
        let courses = [];
        if (relatedCourses.length) {
            courses = relatedCourses;
        } else if (user.profile.role === 'STUDENT') {
            courses = loadedCourses.filter(course => user.courses.includes(course.id));
        } else if (user.profile.role === 'TEACHER') {
            courses = loadedCourses.filter(course => user.courses_taught.includes(course.id));
        }

        const courseNames = courses.map(course => course.title);

        return { ...user, courseNames };
    }
}