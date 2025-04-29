import React, { useEffect, useState } from 'react';
import './CoursesTable.css';
import '../../styles/floatingRows.css';
import '../../styles/floatingButton.css';
import { deleteCourse } from '../../services/coursesServices';
import EditableCourseRow from '../editableCourseRow/EditableCourseRow';
import { useSession } from '../../context/SessionContext';
import { useGetCourseDisplayData } from '../../hooks/courseHooks';
import { DEFAULT_POPUP_STATE, DEFAULT_SELECTION_MODAL_STATE } from '../../lib/constants';
import Popup from '../popup/popup';

export default function CoursesTable() {
    const { 
        loadCourses, loadUsers, loadUserCourses, userState, setSelectionModal,
        setError, loading, setLoading,
    } = useSession();
    const [coursesForDisplay, setCoursesForDisplay] = useState([]);
    const [showNewCourseRow, setShowNewCourseRow] = useState(false);
    const [editableCourseId, setEditableCourseId] = useState(null);
    const getCourseDisplayData = useGetCourseDisplayData();
    const [popup, setPopup] = useState(DEFAULT_POPUP_STATE);

    useEffect(() => {
        populateCourses();
    }, []);

    const populateCourses = async (options) => {
        setLoading(true);
        let updatedCourses = [];

        if (options?.updatedCourses) {
            updatedCourses = options.updatedCourses;
        } else if (userState.role === 'TEACHER') {
            updatedCourses = await loadUserCourses({ userId: userState.id, userRole: userState.role });
        } else {
            updatedCourses = await loadCourses();
        }
        // Get course relational data for display
        const updatedUsers = await loadUsers();
        const newCoursesForDisplay = updatedCourses.map((course) => {
            const relatedUsers = updatedUsers.filter(
                user => course.teacher === user.id || course.enrolled_students.includes(user.id)
            );
            return getCourseDisplayData(course, relatedUsers);
        });
        setCoursesForDisplay(newCoursesForDisplay);
        setLoading(false);
    };

    const handleClickDelete = (courseId) => {
        setPopup({ 
            show: true,
            title: 'Delete course',
            text: 'Are you sure you want to delete this course?',
            buttonLabels: ['Yes, delete', 'No, cancel'],
            buttonOnClicks: [
                () => {
                    handleDeleteCourse(courseId);
                    setPopup(prev => ({...prev, show: false}));
                },
                () => setPopup(prev => ({...prev, show: false})),
            ],
        })
    };
    const handleDeleteCourse = async (courseId) => {
        setLoading(true);
        const result = await deleteCourse(courseId);
        if (result.success) {
            setCoursesForDisplay(courses => courses.filter(el => el.id !== courseId));
        } else {
            setError(
                result.error || 'Something went wrong while deleting course'
            );
        }
        setLoading(false);
    };

    const handleCreatedCourse = (newCourse) => {
        populateCourses({
            updatedCourses: [...coursesForDisplay, newCourse],
        });
        setShowNewCourseRow(false);
        setSelectionModal(DEFAULT_SELECTION_MODAL_STATE);
    }

    const handleEditedCourse = (updatedCourse, idx) => {
        // const unchangedCourses = courses.filter(el => el.id !== updatedCourse.id);
        populateCourses({
            updatedCourses: [...coursesForDisplay.slice(0, idx), updatedCourse, ...coursesForDisplay.slice(idx + 1)],
        });
        setEditableCourseId(null);
        setShowNewCourseRow(false);
        setSelectionModal(DEFAULT_SELECTION_MODAL_STATE);
    }

    const handleCancelEdit = () => {
        setEditableCourseId(null);
        setShowNewCourseRow(false);
    }
    

    return (<>
        <div id='courses-table' className='floating-rows'>
            {coursesForDisplay.map((course, idx) => {
                if (editableCourseId === course.id) {
                    return (
                        <EditableCourseRow
                            key={`course-${course.id}`}
                            course={course}
                            onCancelCreate={handleCancelEdit}
                            onEditedCourse={(updatedCourse) => handleEditedCourse(updatedCourse, idx)}
                        />
                    )
                }
                return (
                    <div className='row fade-in' key={`course-${idx}`}>
                        <div className='title'>
                            <label>Title</label>
                            {course.title}
                        </div>
                        <div className='teacher'>
                            <label>Teacher</label>
                            {course.teacherName}
                        </div>
                        <div className='students'>
                            <label>Students</label>
                            {course.enrolledStudentsNames?.join(', ') || ''}
                        </div>
                        <div className='description'>
                            <label>Description</label>
                            {course.description}
                        </div>
                        <div className='buttons'>
                            <button onClick={() => setEditableCourseId(course.id)}>Edit</button>
                            <button onClick={() => handleClickDelete(course.id)} className='delete-button'>Delete</button>
                        </div>
                    </div>
                );
            })}
            {showNewCourseRow && (
                <EditableCourseRow 
                    onCancelCreate={() => setShowNewCourseRow(false)}
                    onCreatedCourse={handleCreatedCourse}
                />
            )}
        </div>
        {!loading && <button 
            className='floating-button fade-in' 
            type='button' 
            onClick={() => setShowNewCourseRow(true)}
        >Create Course</button>}
        <Popup 
            show={popup.show}
            title={popup.title} text={popup.text} 
            buttonLabels={popup.buttonLabels}
            buttonOnClicks={popup.buttonOnClicks}
        />
    </>);
}
