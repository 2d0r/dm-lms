import React from 'react';
import CoursesGrid from '../components/courses-grid/CoursesGrid';
import Layout from '../components/layout/Layout';

export default function MyLearning() {
    const currentUserId = localStorage.getItem('userId');

    return (
        <Layout>
            <CoursesGrid studentId={currentUserId} />
        </Layout>
    );
}
