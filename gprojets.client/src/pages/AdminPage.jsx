import React from 'react';
import Header from '../components/Header';
import Sidebar from '../components/Sidebar';
import KanbanBoard from '../components/KanbanBoard';

import '../styles/AdminPage.css';

const AdminPage = () => {
    return (
        <div className="admin-container">
            <Sidebar /> {/* Enlève la div supplémentaire ici */}
            <div className="main-content">
                <Header />
                <div className="scrollable-content-wrapper">
                    <KanbanBoard />
                </div>
            </div>
        </div>
    );
};

export default AdminPage;
