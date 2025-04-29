import React from 'react';
import AuthForm from '../components/authForm/AuthForm';

export default function Register() {
    return <AuthForm route='/api/users/' method='register' />;
}
