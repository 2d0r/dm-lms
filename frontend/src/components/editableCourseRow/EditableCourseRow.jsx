import React, { useEffect, useState } from 'react';
import { createCourse, updateCourse } from '../../services/coursesServices';
import './EditableCourseRow.css';
import '../../styles/floatingRows.css';
import { useSession } from '../../context/SessionContext';
import { useGetCourseDisplayData } from '../../hooks/courseHooks';
import SelectionModal from '../selectionModal/SelectionModal';

export default function EditableCourseRow({ 
    course={}, 
    onCancelCreate, onCreatedCourse, onEditedCourse,
}) {

    const { loadedCourses, loadedUsers, userState, selectionModal, setSelectionModal, setError, setLoadedCourses } = useSession();
    const [title, setTitle] = useState(course.title || '');
    const [description, setDescription] = useState(course.description || '');
    const [teacherId, setTeacherId] = useState(course.teacher || '');
    const [teacherName, setTeacherName] = useState(course.teacherName || '');
    const [enrolledStudents, setEnrolledStudents] = useState(course.enrolled_students || []);
    const [enrolledStudentsNames, setEnrolledStudentsNames] = useState(course.enrolledStudentsNames || []);
    const getCourseDisplayData = useGetCourseDisplayData();
    const userRole = userState.role;
    const isNewCourse = !course.id;

    const updateCourseForDisplay = () => {
        const newCourse = loadedCourses.find(el => el.id === course.id);
        if (!newCourse) return;
        const courseForDisplay = getCourseDisplayData(newCourse);
        setTitle(courseForDisplay.title);
        setDescription(courseForDisplay.description);
        setTeacherId(courseForDisplay.teacher);
        setTeacherName(courseForDisplay.teacherName);
        setEnrolledStudentsNames(courseForDisplay.enrolledStudentsNames);
        setEnrolledStudents(courseForDisplay.enrolled_students);
    }

    // HOOKS

    useEffect(() => {
        if (loadedCourses.length && !isNewCourse) updateCourseForDisplay();
        if (userRole === 'TEACHER') {
            setTeacherId(userState.id);
            setTeacherName(userState.name);
        }
    }, []);

    useEffect(() => {
        if (loadedCourses.length && !isNewCourse) updateCourseForDisplay();
    }, [loadedCourses]);


    // HANDLERS

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        let result = await createCourse({ description, title, teacherId });
        if (!result.success) {
            setError(result.error || 'Something went wrong while creating course');
            return;
        }
        let newCourse = result.data;

        // Update course selections
        result = await updateCourse({id: newCourse.id, teacherId, studentIds: enrolledStudents});
        if (!result.success) {
            setError(result.error || 'Something went wrong while changing course\'s teacher');
        }
        newCourse = result.data;

        setLoadedCourses(prev => ({
            ...prev.filter(el => el.id !== newCourse.id),
            newCourse,
        }));
        onCreatedCourse(newCourse);
    };

    const handleEditCourse = async (e) => {
        e.preventDefault();
        console.log('teacherId', teacherId)
        const result = await updateCourse({ 
            id: course.id, 
            title, 
            description,
            teacherId,
            studentIds: enrolledStudents,
        });
        if (result.success) {
            const udpatedCourse = result.data;
            setLoadedCourses(prev => [
                ...prev.filter(el => el.id !== udpatedCourse.id),
                updateCourse,
            ]);
            onEditedCourse(udpatedCourse);
        } else {
            alert(result.error || 'Something went wrong while editing course');
        }
    };

    const handleCancelCreate = () => {
        onCancelCreate();
    };

    const handleEditTeacher = () => {
        if (userRole === 'ADMIN') {
            setSelectionModal(prev => ({
                ...prev,
                show: true,
                type: 'selectTeacher', 
                id: course.id || null,
                selectedIds: teacherId ? [teacherId] : [],
            }));
        }
    };

    const handleEditStudents = () => {
        if (userRole === 'ADMIN') {
            setSelectionModal(prev => ({
                ...prev,
                show: true,
                type: 'selectStudents', 
                id: course.id, 
                selectedIds: enrolledStudents,
            }));
        }
    };

    const handleUpdatedSelection = async ({ type, selectedIds }) => {
        if (type === 'selectTeacher' && selectedIds.length === 1) {
            const newTeacherId = selectedIds[0];
            setTeacherId(newTeacherId);
            setTeacherName(loadedUsers.find(el => el.id === newTeacherId).first_name);
        } else if (type === 'selectTeacher' && selectedIds.length === 0) {
            setTeacherId('');
            setTeacherName('');
        } else if (type === 'selectStudents') {
            const newStudentIds = selectedIds;
            setEnrolledStudents(newStudentIds);
            setEnrolledStudentsNames(newStudentIds.map(studentId => {
                return loadedUsers.find(el => el.id === studentId).first_name;
            }));
        }
    }

    return (<>
        {selectionModal.show && (
            <SelectionModal 
                type={selectionModal.type}
                selectedIds={selectionModal.selectedIds}
                id={selectionModal.id}
                onUpdatedSelection={handleUpdatedSelection}
            />
        )}
        <div id='editable-course-row' className='row editable'>
            <form onSubmit={isNewCourse ? handleCreateCourse : handleEditCourse} >
                <div className='title'>
                    <label htmlFor='title'>Edit Title</label>
                    <input
                        type='text'
                        id='title'
                        name='title'
                        placeholder='New course'
                        required
                        onChange={e => setTitle(e.target.value)}
                        value={title}
                    />
                </div>
                <div className={`teacher${userRole === 'TEACHER' ? ' no-edit' : ''}`} onClick={handleEditTeacher}>
                    <label htmlFor='teacher'>{userRole === 'TEACHER' ? '' : 'Edit '}Teacher</label>
                    {teacherName}
                </div>
                <div className={`students${userRole === 'TEACHER' ? ' no-edit': ''}`} onClick={handleEditStudents}>
                    <label htmlFor='students'>{userRole === 'TEACHER' ? '' : 'Edit '}Students</label>
                    {enrolledStudentsNames.join(', ')}
                </div>
                <div className='description'>
                    <label htmlFor='description'>Edit Description</label>
                    <textarea
                        type='text'
                        id='description'
                        name='description'
                        placeholder='Write a description'
                        required
                        onChange={e => setDescription(e.target.value)}
                        value={description}
                    />
                </div>
                <div className='buttons'>
                    <button type='submit'>Save</button>
                    <button type='button' onClick={handleCancelCreate}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </>);
}
