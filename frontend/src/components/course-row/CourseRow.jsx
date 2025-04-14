import React from 'react';
import { createCourse } from '../../services/coursesServices';

export default function CourseRow() {

    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [courses, setCourses] = useState([]); // To do: move to parent

    const handleCreateCourse = async (e) => {
        setLoading(true);
        e.preventDefault();

        const result = await createCourse({ description, title });
        if (result.success) {
            const newCourse = result.data;
            const teacherName = users.find(
                user => user.id === newCourse.teacher
            ).first_name;

            setCourses(courses => [...courses, { ...newCourse, teacherName }]);
        } else {
            setError(
                result.error || 'Something went wrong while creating course'
            );
        }
        setLoading(false);
    };

    return (
        <div className='course-row'>
            <form onSubmit={handleCreateCourse}>
                <label htmlFor='title'>Title:</label>
                <input
                    type='text'
                    id='title'
                    name='title'
                    required
                    onChange={e => setTitle(e.target.value)}
                    value={title}
                />
                <br />
                <label htmlFor='description'>Description:</label>
                <textarea
                    type='text'
                    id='description'
                    name='description'
                    required
                    onChange={e => setDescription(e.target.value)}
                    value={description}
                ></textarea>
                <br />
                <input type='submit' value='Submit' />
            </form>
        </div>
    );
}
