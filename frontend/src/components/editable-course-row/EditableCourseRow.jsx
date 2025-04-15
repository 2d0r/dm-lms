import React, { useState } from 'react';
import { createCourse, updateCourse } from '../../services/coursesServices';
import './EditableCourseRow.css';
import '../../styles/floatingRows.css';

export default function EditableCourseRow(props) {
    const course = props.course || {
        title: '',
        description: '',
        teacher: '',
        enrolledStudentsNames: [],
    }

    const [title, setTitle] = useState(course.title);
    const [description, setDescription] = useState(course.description);

    const handleCreateCourse = async e => {
        e.preventDefault();
        const result = await createCourse({ description, title });
        if (result.success) {
            const newCourse = result.data;
            props.onCreatedCourse(newCourse);
        } else {
            alert(result.error || 'Something went wrong while creating course');
        }
    };

    const handleEditCourse = async (e) => {
        e.preventDefault();
        const result = await updateCourse({ 
            id: course.id, title, description 
        });
        if (result.success) {
            const udpatedCourse = result.data;
            props.onEditedCourse(udpatedCourse);
        } else {
            alert(result.error || 'Something went wrong while editing course');
        }
    }

    const handleCancelCreate = () => {
        props.onCancelCreate();
    };

    return (
        <div className='row editable'>
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
                <div className='teacher'>
                    <label htmlFor='teacher'>Edit Teacher</label>
                    {course.teacherName}
                    {/* <Dropdown options={teachers} /> */}
                </div>
                <div className='students'>
                    <label htmlFor='students'>Edit Students</label>
                    {course.enrolledStudentsNames.join(', ')}
                    {/* <select name='teacher' id='students' multiple>
                        {course.enrolledStudentsNames.map(name => {
                            return <option value={name} key={`option-${name}`}>{name}</option>
                        })}
                    </select> */}
                    {/* <Multiselect options={students} /> */}
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
                    {props.course ? (
                        <>
                            <button type='submit'>Done</button>
                            <button type='button' onClick={handleCancelCreate}>
                                Cancel
                            </button>
                        </>
                    ) : (
                        <>
                            <button type='submit'>Add</button>
                            <button type='button' onClick={handleCancelCreate}>
                                Cancel
                            </button>
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}
