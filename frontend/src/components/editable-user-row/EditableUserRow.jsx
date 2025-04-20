import React, { useEffect, useState } from 'react';
import { createUser, getUser, updateUser } from '../../services/usersServices';
import './EditableUserRow.css';
import '../../styles/floatingRows.css';
import { useSession } from '../../context/SessionContext';
import { useGetUserDisplayData } from '../../hooks/userHooks';

export default function EditableUserRow(props) {

    const { loadedUsers } = useSession();
    const [name, setName] = useState(props.user.first_name || '');
    const [username, setUsername] = useState(props.user.username || '');
    const [role, setRole] = useState(props.user.profile.role || '');
    const [password, setPassword] = useState(props.user.password || '');
    const [courseIds, setCourseIds] = useState(props.user.courseIds || []);
    const [courseNames, setCourseNames] = useState(props.user.courseNames || []);
    const getUserDisplayData = useGetUserDisplayData();

    const updateUserForDisplay = () => {
        const user = loadedUsers.find(el => el.id === props.user.id);
        const userForDisplay = getUserDisplayData(user, user.courses);
        console.log('userForDisplay', userForDisplay);
        setName(userForDisplay.name);
        setUsername(userForDisplay.username);
        setRole(userForDisplay.profile.role);
        setCourseNames(userForDisplay.courseNames);
        // setCourseIds(userForDisplay.courseIds);
    }

    useEffect(() => {
        updateUserForDisplay();
    }, []);

    useEffect(() => {
        updateUserForDisplay();
    }, [loadedUsers]);

    const handleCreateUser = async e => {
        e.preventDefault();
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
    const handleEditCourses = () => {
        props.onEditCourses({
            type: role === 'STUDENT' ? 'selectCoursesForStudent' : 'selectCoursesForTeacher', 
            selectedIds: courseIds,
            id: props.user.id || null,
        });
    }

    return (
        <div id='editable-user-row' className='row editable'>
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
                            required={!props.user}
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
                <div className='courses' onClick={handleEditCourses}>
                    <label htmlFor='courses'>Edit Courses</label>
                    {courseNames?.join(', ')}
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
