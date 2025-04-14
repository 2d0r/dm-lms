import React, { useEffect, useState } from 'react';
import { deleteUser, getUsers } from '../../services/usersServices';
import Layout from '../../components/layout/Layout';
import './ManageUsers.css';
import '../../styles/floatingRows.css';
import '../../styles/floatingButton.css';
import { getCourses } from '../../services/coursesServices';

export default function ManageUsers() {
    const [users, setUsers] = useState([]);
    const [courses, setCourses] = useState([]);

    const populateUsers = async () => {
        const res = await getUsers();
        if (res.success) {
            setUsers(res.data);
        } else {
            alert(
                res.error ||
                'Something went wrong while populating users'
            );
        }
    };

    const loadCourses = async () => {
        const res = await getCourses();
        if (res.success) {
            setCourses(res.data);
        } else {
            alert(
                res.error ||
                'Something went wrong while populating users'
            );
        }
    }

    const getCoursesForUser = (userId) => {
        const user = users.find(el => el.id === userId);
        if (user.profile.role === 'STUDENT') {
            return courses.filter(el => el.enrolled_students.includes(user.id)).map(el => el.title).join(', ');
        } else if (user.profile.role === 'TEACHER') {
            return courses.filter(el => el.teacher === user.id).map(el => el.title).join(', ');
        }
        return 'N/A';
    }

    useEffect(() => {
        populateUsers();
        loadCourses();
    }, []);

    const handleDeleteUser = async id => {
        setLoading(true);
        const result = await deleteUser(id);
        if (result.success) {
            setUsers(users => users.filter(el => el.id !== id));
        } else {
            setError(
                result.error || 'Something went wrong while deleting user'
            );
        }
        setLoading(false);
    };


    return (
        <Layout>
            <div className='users-table floating-rows'>
                {users.map(user => {
                    return (
                        <div className='row' key={`user-${user.id}`}>
                            <div className='name'>
                                <label>Name</label>
                                {user.first_name || 'N/A'}
                            </div>
                            <div className='id'>
                                <label>Id</label>
                                {user.id}
                            </div>
                            <div className='username'>
                                <label>Username</label>
                                {user.username}
                            </div>
                            <div className='role'>
                                <label>Role</label>
                                {user.profile?.role || 'Loading...'}
                            </div>
                            <div className='courses'>
                                <label>Courses</label>
                                {getCoursesForUser(user.id)}
                            </div>
                            <div className='buttons'>
                                <button>Edit</button>
                                <button
                                    onClick={() => handleDeleteUser(user.id)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    );
                })}
            </div>
            <button className='floating-button'>Add User</button>
        </Layout>
    );
}
