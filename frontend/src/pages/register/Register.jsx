import React from 'react';
import AuthForm from '../../components/authForm/AuthForm';

export default function Register() {
    return (
        <section className='form-overlay'>
            <AuthForm route='/api/user/register/' method='register' />
        </section>
    );
}
