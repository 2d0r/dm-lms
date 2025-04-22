import React, { useEffect, useState } from 'react';
import { createUser, getUser, updateUser, updateUserEnrollments } from '../../services/usersServices';
import './EditableUserRow.css';
import '../../styles/floatingRows.css';
import { useSession } from '../../context/SessionContext';
import { useGetUserDisplayData } from '../../hooks/userHooks';
import SelectionModal from '../selectionModal/SelectionModal';
import { useGetCourseNameFromId } from '../../hooks/courseHooks';

export default function EditableUserRow({
    user = { profile: {} }, 
    onCreatedUser, onEditedUser, onEditCourses, onCancel, 
}) {

    const { loadedUsers, loadedCourses, reloadUser, selectionModal, setError } = useSession();
    const [name, setName] = useState(user.first_name || '');
    const [username, setUsername] = useState(user.username || '');
    const [role, setRole] = useState(user.profile?.role || 'STUDENT');
    const [password, setPassword] = useState(user.password || '');
    const [courseIds, setCourseIds] = useState(user.courseIds || []);
    const [courseNames, setCourseNames] = useState(
        user.courseNames || []
    );
    const getUserDisplayData = useGetUserDisplayData();
    const isNewUser = !user.id;
    const getCourseNameFromId = useGetCourseNameFromId();

    const updateUserForDisplay = () => {
        if (isNewUser) {
            return;
        }
        const newUser = loadedUsers.find(el => el.id === user.id);
        const relatedCourses =
            newUser.profile.role === 'STUDENT'
                ? newUser.courses
                : newUser.courses_taught;
        const userForDisplay = getUserDisplayData(newUser, relatedCourses);
        setName(userForDisplay.name);
        setUsername(userForDisplay.username);
        setRole(userForDisplay.profile.role);
        setCourseNames(userForDisplay.courseNames);
        // setCourseIds(userForDisplay.courses);
    };

    useEffect(() => {
        updateUserForDisplay();
    }, []);

    useEffect(() => {
        updateUserForDisplay();
    }, [loadedUsers]);

    const handleCreateUser = async e => {
        e.preventDefault();
        const result1 = await createUser({
            name,
            username,
            password,
            role: role || 'STUDENT',
        });
        if (!result1.success) {
            setError(result1.error || 'Something went wrong while creating user');
            return;
        }
        const newUserId = result1.data.id;

        const courseSelection = selectionModal.type === 'selectCoursesForStudent' ? selectionModal.selectedIds : null;
        if (courseSelection) {
            const result2 = await updateUserEnrollments({ userId: newUserId, courseIds: courseSelection });
            if (!result2.success) {
                setError(result2.error || 'Something went wrong while changing course\'s teacher');
            }
        }
        
        const newUser = reloadUser(newUserId);
        onCreatedUser(newUser);
    };

    const handleEditUser = async (e) => {
        e.preventDefault();
        const result1 = await updateUser({
            id: user.id,
            name,
            username,
            password,
            role,
        });
        if (!result1.success) {
            setError(result1.error || 'Something went wrong while editing user');
        }

        const courseSelection = selectionModal.type === 'selectCoursesForStudent' ? selectionModal.selectedIds : null;
        if (courseSelection) {
            const result2 = await updateUserEnrollments({ userId: user.id, courseIds: courseSelection });
            if (!result2.success) {
                setError(result2.error || 'Something went wrong while changing course\'s teacher');
            }
        }
        
        const updatedUser = reloadUser(user.id);
        onEditedUser(updatedUser);
    };

    const handleRoleChange = (e) => {
        setCourseIds([]);
        setCourseNames([]);
        setRole(e.target.value);
    }
    
    const handleClickToEditCourses = () => {
        if (role !== 'STUDENT') { return; }
        const selectionModalOptions = {
            show: true,
            type:
                role === 'STUDENT'
                    ? 'selectCoursesForStudent'
                    : 'selectCoursesForTeacher',
            selectedIds: courseIds,
            id: user.id || null,
        }
        onEditCourses(selectionModalOptions);
    };

    const handleUpdatedSelection = async ({ type, selectedIds }) => {
        if (type === 'selectCoursesForStudent') {
            setCourseIds(selectedIds);
            const courseNames = await Promise.all(selectedIds.map(async (courseId) => {
                const courseName = await getCourseNameFromId(courseId);
                return courseName || '';
            }));
            setCourseNames(courseNames);
        }
    }

    const handleCancel = () => {
        onCancel();
    };

    return (<>
        {selectionModal.show && (
            <SelectionModal 
                type={selectionModal.type}
                selectedIds={selectionModal.selectedIds}
                id={selectionModal.id}
                onUpdatedSelection={handleUpdatedSelection}
            />
        )}
        <div id='editable-user-row' className='row editable'>
            <form onSubmit={isNewUser ? handleCreateUser : handleEditUser}>
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
                            required={isNewUser}
                            onChange={e => setPassword(e.target.value)}
                            value={password}
                        />
                    </div>
                </div>
                <div className='role'>
                    <label htmlFor='role'>Edit Role</label>
                    <select
                        name='role'
                        id='role'
                        defaultValue={role}
                        onChange={handleRoleChange}
                    >
                        <option value='STUDENT'>STUDENT</option>
                        <option value='TEACHER'>TEACHER</option>
                        <option value='ADMIN'>ADMIN</option>
                    </select>
                    {/* <Dropdown /> */}
                </div>
                <div
                    className={`courses${role !== 'STUDENT' ? ' no-edit' : ''}`}
                    onClick={handleClickToEditCourses}
                >
                    <label htmlFor='courses'>
                        {role === 'TEACHER' ? 'Courses (Edit in Manage Courses)' :
                        role === 'ADMIN' ? 'Courses' : 'Edit Courses'}
                    </label>
                    {courseNames?.join(', ')}
                </div>
                <div className='buttons'>
                    <button type='submit'>Save</button>
                    <button type='button' onClick={handleCancel}>
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    </>);
}
