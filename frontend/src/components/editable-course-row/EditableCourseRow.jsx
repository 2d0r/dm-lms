import React, { useEffect, useState } from 'react';
import { createCourse, updateCourse } from '../../services/coursesServices';
import './EditableCourseRow.css';
import '../../styles/floatingRows.css';
import { useSession } from '../../context/SessionContext';
import { useGetCourseDisplayData } from '../../hooks/courseHooks';

export default function EditableCourseRow(props) {

    const [title, setTitle] = useState(props.course.title || '');
    const [description, setDescription] = useState(props.course.description || '');
    const [teacherId, setTeacherId] = useState(props.course.teacher || '');
    const [teacherName, setTeacherName] = useState(props.course.teacherName || '');
    const [enrolledStudents, setEnrolledStudents] = useState(props.course.enrolled_students || []);
    const [enrolledStudentsNames, setEnrolledStudentsNames] = useState(props.course.enrolledStudentsNames || []);
    const { loadedCourses, setLoadedCourses, setError } = useSession();
    const getCourseDisplayData = useGetCourseDisplayData();

    const updateCourseForDisplay = () => {
        const course = loadedCourses.find(el => el.id === props.course.id);
        const courseForDisplay = getCourseDisplayData(course);
        setTitle(courseForDisplay.title);
        setDescription(courseForDisplay.description);
        setTeacherId(courseForDisplay.teacher);
        setTeacherName(courseForDisplay.teacherName);
        setEnrolledStudentsNames(courseForDisplay.enrolledStudentsNames);
        setEnrolledStudents(courseForDisplay.enrolled_students);
    }

    useEffect(() => {
        updateCourseForDisplay();
    }, []);

    useEffect(() => {
        updateCourseForDisplay();
    }, [loadedCourses]);

    const handleCreateCourse = async (e) => {
        e.preventDefault();
        const result = await createCourse({ description, title });
        if (result.success) {
            const newCourse = result.data;
            setLoadedCourses(prev => ({...prev, newCourse}));
            // props.onCreatedCourse(newCourse);
        } else {
            setError(result.error || 'Something went wrong while creating course');
        }
    };

    const handleEditCourse = async (e) => {
        e.preventDefault();
        const result = await updateCourse({ 
            id: props.course.id, title, description 
        });
        if (result.success) {
            const udpatedCourse = result.data;
            props.onEditedCourse(udpatedCourse);
        } else {
            alert(result.error || 'Something went wrong while editing course');
        }
    };
    const handleCancelCreate = () => {
        props.onCancelCreate();
    };
    const handleEditTeacher = () => {
        props.onShowSelectionModal('selectTeacher', props.course.id, [teacherId]);
    };
    const handleEditStudents = () => {
        props.onShowSelectionModal('selectStudents', props.course.id, enrolledStudents);
    };

    return (
        <div id='editable-course-row' className='row editable'>
            <form
                onSubmit={props.course ? handleEditCourse : handleCreateCourse}
            >
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
                <div className='teacher' onClick={handleEditTeacher}>
                    <label htmlFor='teacher'>Edit Teacher</label>
                    {teacherName}
                </div>
                <div className='students' onClick={handleEditStudents}>
                    <label htmlFor='students'>Edit Students</label>
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
    );
}
