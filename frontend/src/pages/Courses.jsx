import React from 'react';
import CoursesGrid from '../components/coursesGrid/CoursesGrid';
import Layout from '../components/layout/Layout';
import { useSession } from '../context/SessionContext';
import LoadingAnimation from '../components/loadingAnimation/LoadingAnimation';

export default function Courses() {

    const { loading } = useSession();

    return (
        <Layout>
            {loading ? <LoadingAnimation />
                : <CoursesGrid />
            }
        </Layout>
    );
}
