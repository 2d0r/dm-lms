import React from 'react';
import './Navbar.css';
import NavButton from '../navButton/NavButton';
import { useSession } from '../../context/SessionContext';

export default function Navbar() {
    const { userState } = useSession();
    const role = userState.role;

    return (
        <header>
            <span className='site-title'>D&M Academy</span>
            <nav>
                {role === 'STUDENT' && (<>
                    <NavButton label='Courses' path='/' />
                    <NavButton label='My Learning' path='/my-learning' />
                </>)}
                {role === 'TEACHER' && (<>
                    <NavButton label='Courses' path='/' />
                    <NavButton label='My Courses' path='/my-courses' />
                </>)}
                {role === 'ADMIN' && (<>
                    <NavButton label='Courses' path='/manage-courses' />
                    <NavButton label='Users' path='/manage-users' />
                </>)}
                <NavButton label='Logout' path='/logout' />
            </nav>
        </header>
    );
}
