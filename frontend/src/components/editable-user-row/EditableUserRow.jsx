import React, { useEffect, useState } from 'react';
import { createUser, updateUser } from '../../services/usersServices';
import './EditableUserRow.css';
import '../../styles/floatingRows.css';

export default function EditableUserRow(props) {

    const user = props.user || {
        first_name: '',
        username: '',
        role: '',
        password: '',
        courses: [],
        courseNames: [],
    }

    const [name, setName] = useState(user.first_name);
    const [username, setUsername] = useState(user.username);
    const [role, setRole] = useState(user.role);
    const [password, setPassword] = useState(user.password);
    const [courses, setCourses] = useState(user.courses);
    const [courseNames, setCourseNames] = useState(user.courseNames);

    useEffect(() => {
        console.log('user', props.user);
    }, []);

    const handleCreateUser = async e => {
        e.preventDefault();
        console.log({ name, username, password, role });
        const result = await createUser({ name, username, password, role: role || 'STUDENT' });
        if (result.success) {
            const newUser = result.data;
            props.onCreatedUser(newUser);
        } else {
            alert(result.error || 'Something went wrong while creating user');
        }
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        const result = await updateUser({ 
            id: props.user.id, 
            name,
            username,
            password,
            role 
        });
        if (result.success) {
            const udpatedUser = result.data;
            props.onEditedUser(udpatedUser);
        } else {
            alert(result.error || 'Something went wrong while editing user');
        }
    }

    const handleCancelCreate = () => {
        props.onCancelCreate();
    };

    return (
        <div className='row editable edit-user'>
            <form
                onSubmit={props.user ? handleEditUser : handleCreateUser}
            >
                <div className='name'>
                    <label htmlFor='name'>Edit Name</label>
                    <input
                        type='text'
                        id='name'
                        name='name'
                        placeholder='Name'
                        required
                        onChange={e => setName(e.target.value)}
                        value={name}
                    />
                </div>
                <div className='username-password'>
                    <div className='username'>
                        <label htmlFor='username'>Edit Username</label>
                        <input
                            type='text'
                            id='username'
                            name='username'
                            placeholder='Username'
                            required
                            onChange={e => setUsername(e.target.value)}
                            value={username}
                        />
                    </div>
                    <div className='password'>
                        <label htmlFor='password'>Edit Password</label>
                        <input
                            type='password'
                            id='password'
                            name='password'
                            placeholder='Password'
                            required
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                        />
                    </div>
                </div>
                <div className='role'>
                    <label htmlFor='role'>Edit Role</label>
                    <select name='role' id='role' defaultValue={role}
                        onChange={() => setRole(e.target.value)}
                    >
                        <option value='STUDENT'>STUDENT</option>
                        <option value='TEACHER'>TEACHER</option>
                        <option value='ADMIN'>ADMIN</option>
                    </select>
                    {/* <Dropdown /> */}
                </div>
                <div className='courses'>
                    <label htmlFor='courses'>Edit Courses</label>
                    {/* {user.courseNames?.join(', ')} */}
                    {/* <Multiselect options={students} /> */}
                </div>
                <div className='buttons'>
                    {!!props.user ? (
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
