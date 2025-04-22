import React, { useEffect, useState } from 'react';
import './CoursesTable.css';
import '../../styles/floatingRows.css';
import '../../styles/floatingButton.css';
import { deleteCourse } from '../../services/coursesServices';
import EditableCourseRow from '../../components/editable-course-row/EditableCourseRow';
import SelectionModal from '../../components/selection-modal/SelectionModal';
import { useSession } from '../../context/SessionContext';
import { useGetCourseDisplayData } from '../../hooks/courseHooks';

export default function CoursesTable() {
    const [coursesForDisplay, setCoursesForDisplay] = useState([]);
    const [showNewCourseRow, setShowNewCourseRow] = useState(false);
    const [editableCourseId, setEditableCourseId] = useState(null);
    const [selectionModal, setSelectionModal] = useState({type: '', id: null, selectedIds: []});
    const { loadCourses, loadUsers, setError, setLoading, loadUserCourses } = useSession();
    const getCourseDisplayData = useGetCourseDisplayData();
    const userRole = localStorage.getItem('userRole');
    const userId = Number(localStorage.getItem('userId'));

    useEffect(() => {
        populateCourses();
    }, []);

    const populateCourses = async (options) => {
        let updatedCourses = [];

        if (options?.updatedCourses) {
            updatedCourses = options.updatedCourses;
        } else if (userRole === 'TEACHER') {
            updatedCourses = await loadUserCourses({ userId, userRole });
        } else {
            updatedCourses = await loadCourses();
        }
        // Get course relational data for display
        const updatedUsers = await loadUsers();
        const newCoursesForDisplay = updatedCourses.map((course) => {
            const relatedUsers = updatedUsers.filter(user => course.teacher === user.id || course.enrolled_students.includes(user.id));
            return getCourseDisplayData(course, relatedUsers);
        });
        setCoursesForDisplay(newCoursesForDisplay);
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
    }

    const handleEditedCourse = (updatedCourse, idx) => {
        // const unchangedCourses = courses.filter(el => el.id !== updatedCourse.id);
        populateCourses({
            updatedCourses: [...coursesForDisplay.slice(0, idx), updatedCourse, ...coursesForDisplay.slice(idx + 1)],
        });
        setEditableCourseId(null);
        setShowNewCourseRow(false);
    }

    const handleCancelEdit = () => {
        setEditableCourseId(null);
        setShowNewCourseRow(false);
    }

    

    return (<>
        {selectionModal.id && (
            <SelectionModal 
                type={selectionModal.type}
                id={selectionModal.id}
                selectedIds={selectionModal.selectedIds}
                onCloseModal={() => setSelectionModal({type: '', selectedIds: [], id: null})}
            />
        )}
        <div id='courses-table' className='floating-rows'>
            {coursesForDisplay.map((course, idx) => {
                if (editableCourseId === course.id) {
                    return (
                        <EditableCourseRow
                            key={`course-${course.id}`}
                            course={course}
                            onCancelCreate={handleCancelEdit}
                            onEditedCourse={(updatedCourse) => handleEditedCourse(updatedCourse, idx)}
                            onShowSelectionModal={(type, id, selectedIds) => setSelectionModal({type, id, selectedIds})}
                        />
                    )
                }
                return (
                    <div className='row' key={`course-${idx}`}>
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
                            <button onClick={() => handleDeleteCourse(course.id)}>Delete</button>
                        </div>
                    </div>
                );
            })}
            {showNewCourseRow && (
                <EditableCourseRow 
                    onCancelCreate={() => setShowNewCourseRow(false)}
                    onCreatedCourse={handleCreatedCourse}
                    onShowSelectionModal={(type, id, selectedIds) => setSelectionModal({type, id, selectedIds})}
                />
            )}
        </div>
        <button 
            className='floating-button' 
            type='button' 
            onClick={() => setShowNewCourseRow(true)}
        >Create Course</button>
    </>);
}
