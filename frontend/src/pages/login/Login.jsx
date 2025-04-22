import React from 'react';
import AuthForm from '../../components/authForm/AuthForm';
import './Login.css';

export default function Login() {
    return (
        <section className='form-overlay'>
            <AuthForm route='/api/token/' method='login' />
        </section>
    );
}
