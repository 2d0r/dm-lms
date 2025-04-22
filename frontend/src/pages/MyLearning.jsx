import React from 'react';
import CoursesGrid from '../components/coursesGrid/CoursesGrid';
import Layout from '../components/layout/Layout';
import { useSession } from '../context/SessionContext';

export default function MyLearning() {
    const { userState } = useSession();

    return (
        <Layout>
            <CoursesGrid studentId={userState.id} />
        </Layout>
    );
}
