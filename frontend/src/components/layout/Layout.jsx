import React from 'react';
import Navbar from '../navbar/Navbar';
import './Layout.css';
import { useSession } from '../../context/SessionContext';
import LoadingAnimation from '../loadingAnimation/LoadingAnimation';

export default function Layout({ children }) {

    const { loading } = useSession();

    return (
        <div className='wrapper'>
            <Navbar />
            {loading ? <LoadingAnimation />
                : <main>{children}</main>
            }
        </div>
    );
}
