import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import './NavButton.css';

export default function NavButton({label, path}) {
    const navigate = useNavigate();
    const location = useLocation();
    const pathname = location.pathname;

    return (
        <div className={`nav-button${pathname.endsWith(path) ? ' selected' : ''}`}>
            <div className='vertical-line'></div>
            <button onClick={() => navigate(path)}>{label}</button>
            <div className='vertical-line'></div>
        </div>
    );
}
