import React, { useState, useEffect } from 'react';
import { deleteCourse, getCourses } from '../../services/coursesServices';
import { getUsers } from '../../services/usersServices';
import { enrollSelf, unenrollSelf } from '../../services/userCourseServices';
import './CoursesGrid.css';
import { useSession } from '../../context/SessionContext';

export default function CoursesGrid(props) {
    const { userState, setLoading, setError } = useSession();
    const [courses, setCourses] = useState([]);

    const populateCourses = async () => {
        const coursesRes = await getCourses();
        const usersRes = await getUsers();
        if (coursesRes.success && usersRes.success) {
            let courses = coursesRes.data;
            if (props.studentId) {
                courses = courses.filter(course => course.enrolled_students.includes(Number(props.studentId)));
            }
            const users = usersRes.data;
            const coursesWithTeacherName = courses.map(course => {
                const teacher = users.find(user => user.id === course.teacher);
                return { ...course, teacherName: teacher.first_name };
            });
            setCourses(coursesWithTeacherName);
        } else {
            setError(
                coursesRes.error ||
                    usersRes.error ||
                    'Something went wrong while populating courses'
            );
        }
    };

    useEffect(() => {
        populateCourses();
    }, []);
    

    const handleEnroll = async (courseId) => {
        const result = await enrollSelf(courseId);
        if (result.success) {
            populateCourses();
        } else {
            setError(result.error || 'Something went wrong while unenrolling');
        }
    }

    const handleUnenroll = async (courseId) => {
        const result = await unenrollSelf(courseId);
        if (result.success) {
            populateCourses();
        } else {
            setError(result.error || 'Something went wrong while unenrolling');
        }
    }

    const handleDeleteCourse = async (courseId) => {
        setLoading(true);
        const result = await deleteCourse(courseId);
        if (result.success) {
            populateCourses();
            // const updatedCourses = courses => courses.filter(el => el.id !== courseId);
        } else {
            setError(
                result.error || 'Something went wrong while deleting course'
            );
        }
        setLoading(false);
    };

    return (
        <div className='course-grid'>
            {courses.map(course => {
                const isEnrolled = !!course.enrolled_students.find(
                    el => el === Number(userState.id)
                );
                const buttonLabel = isEnrolled && props.studentId ? 'Unenroll' : isEnrolled ? 'Enrolled' : 'Enroll';
                
                return (
                    <div className='course-card' key={`course-${course.id}`}>
                        <div className='card-head'>
                            <span className='title'>{course.title}</span>
                            <span className='subtitle'>prof. {course.teacherName}</span>
                        </div>
                        <div className='description'>{course.description}</div>
                        <div className='buttons' hidden={userState.role === 'TEACHER'}>
                            {userState.role === 'ADMIN' && (
                                <button
                                    className='delete-button'
                                    onClick={() => handleDeleteCourse(course.id)}
                                >
                                    Delete
                                </button>
                            )}
                            {userState.role === 'STUDENT' && (
                                <button 
                                    className={!isEnrolled || props.studentId ? 'highlight' : ''}
                                    onClick={() => {
                                        if (isEnrolled && buttonLabel === 'Unenroll') handleUnenroll(course.id);
                                        else handleEnroll(course.id);
                                    }}
                                >
                                    {buttonLabel}
                                </button>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
