import React from 'react';
import './Navbar.css';
import NavButton from '../navButton/NavButton';

export default function Navbar() {
    const currentRole = localStorage.getItem('userRole');

    return (
        <header>
            <span className='site-title'>D&M Academy</span>
            <nav>
                {currentRole === 'STUDENT' || currentRole === 'TEACHER' ? (
                    <NavButton label='Courses' path='/' />
                ) : (
                    <NavButton label='Courses' path='/manage-courses' />
                )}
                {currentRole === 'STUDENT' && (
                    <NavButton label='My Learning' path='/my-learning' />
                )}
                {currentRole === 'TEACHER' && (
                    <NavButton label='My Courses' path='/my-courses' />
                )}
                {currentRole === 'ADMIN' && (
                    <NavButton label='Users' path='/manage-users' />
                )}
                <NavButton label='Logout' path='/logout' />
            </nav>
        </header>
    );
}
