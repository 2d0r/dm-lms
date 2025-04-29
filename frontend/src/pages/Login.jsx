import React from 'react';
import AuthForm from '../components/authForm/AuthForm';

export default function Login() {
    return <AuthForm route='/api/token/' method='login' />;
}
