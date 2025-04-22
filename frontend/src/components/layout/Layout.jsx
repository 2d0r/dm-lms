import React from 'react';
import Navbar from '../navbar/Navbar';
import Footer from '../footer/Footer';
import './Layout.css';

export default function Layout({ children }) {
    return (
        <div className='wrapper'>
            <Navbar />
            <main>{children}</main>
            {/* <Footer /> */}
        </div>
    );
}
