import React, { useState, useEffect } from 'react';
import { deleteCourse, getCourses } from '../../services/coursesServices';
import { getUsers } from '../../services/usersServices';
import { enrollSelf, unenrollSelf } from '../../services/userCourseServices';
import './CoursesGrid.css';
import { useSession } from '../../context/SessionContext';
import { DEFAULT_POPUP_STATE } from '../../lib/constants';
import Popup from '../popup/popup';
import LoadingAnimation from '../loadingAnimation/LoadingAnimation';

export default function CoursesGrid(props) {
    const { userState, loading, setLoading, setError } = useSession();
    const [courses, setCourses] = useState([]);
    const [popup, setPopup] = useState(DEFAULT_POPUP_STATE);

    useEffect(() => {
        setLoading(true);
        populateCourses();
        setLoading(false);
    }, []);

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
                return { ...course, teacherName: teacher?.first_name };
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

    const handleClickDelete = (courseId) => {
        setPopup({ 
            show: true,
            title: 'Delete course',
            text: 'Are you sure you want to delete this course?',
            buttonLabels: ['Yes, delete', 'No, cancel'],
            buttonOnClicks: [
                () => {
                    handleDeleteCourse(courseId);
                    setPopup(DEFAULT_POPUP_STATE);
                },
                () => setPopup(DEFAULT_POPUP_STATE),
            ]
        })
    };
    const handleDeleteCourse = async (courseId) => {
        const result = await deleteCourse(courseId);
        if (result.success) {
            populateCourses();
        } else {
            setError(
                result.error || 'Something went wrong while deleting course'
            );
        }
    };

    return loading ? <LoadingAnimation /> : (<>
        <div className='course-grid'>
            {courses.map(course => {
                const isEnrolled = !!course.enrolled_students.find(
                    el => el === Number(userState.id)
                );
                const buttonLabel = isEnrolled && props.studentId ? 'Unenroll' : isEnrolled ? 'Enrolled' : 'Enroll';
                
                return (
                    <div className='course-card fade-in' key={`course-${course.id}`}>
                        <div className='card-head'>
                            <span className='title'>{course.title}</span>
                            <span className='subtitle'>prof. {course.teacherName || 'TBA'}</span>
                        </div>
                        <div className='description'>{course.description}</div>
                        <div className='buttons' hidden={userState.role === 'TEACHER'}>
                            {userState.role === 'ADMIN' && (
                                <button
                                    className='delete-button red'
                                    // onClick={() => handleDeleteCourse(course.id)}
                                    onClick={() => handleClickDelete(course.id)}
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
        <Popup
            show={popup.show}
            title={popup.title} text={popup.text} 
            buttonLabels={popup.buttonLabels}
            buttonOnClicks={popup.buttonOnClicks}
        />
    </>);
}
