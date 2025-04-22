import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/register/Register';
import Courses from './pages/Courses';
import NotFound from './pages/NotFound';
import ProtectedRoute from './components/ProtectedRoute';
import ManageUsers from './pages/manageUsers/ManageUsers';
import MyCourses from './pages/MyCourses';
import MyLearning from './pages/MyLearning';
import ManageCourses from './pages/ManageCourses';

function Logout() {
    localStorage.clear();
    return <Navigate to='/login' />;
}

function RegisterAndLogout() {
    localStorage.clear();
    return <Register />;
}

function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path='/login' element={<Login />} />
                <Route path='/logout' element={<Logout />} />
                <Route path='/register' element={<RegisterAndLogout />} />
                <Route path='*' element={<NotFound />} />
                <Route 
                    path='/'
                    element={
                        <ProtectedRoute>
                            <Courses />
                        </ProtectedRoute>
                    }
                />
                <Route 
                    path='/my-learning'
                    element={
                        <ProtectedRoute authorisedRole='STUDENT'>
                            <MyLearning />
                        </ProtectedRoute>
                    }
                />
                <Route 
                    path='/my-courses'
                    element={
                        <ProtectedRoute authorisedRole='TEACHER'>
                            <MyCourses />
                        </ProtectedRoute>
                    }
                />
                <Route 
                    path='/manage-users'
                    element={
                        <ProtectedRoute authorisedRole='ADMIN'>
                            <ManageUsers />
                        </ProtectedRoute>
                    }
                />
                <Route 
                    path='/manage-courses'
                    element={
                        <ProtectedRoute authorisedRole='ADMIN'>
                            <ManageCourses />
                        </ProtectedRoute>
                    }
                />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
