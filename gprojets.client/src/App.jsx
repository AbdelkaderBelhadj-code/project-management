import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import GestionProjets from './pages/GestionProjets';
import GestionEquipe from './pages/GestionEquipe';
import Sidenav from './components/Sidenav';
import Dashboard from './pages/Dashboard';
import ChefDashboard from './pages/ChefDashboard';
import MemberDashboard from './pages/MemberDashboard';
import CalendarPage from './pages/CalendarPage';
import ProtectedRoute from './helpers/ProtectedRoute';
import UserProjectsTable from './pages/UserProjectsTable';
import ProjectMembersTasksManager from './pages/ProjectMembersTasksManager';
import UserTasks from './pages/UserTasks';

function App() {
    return (
        <Router>
            <Routes>
            <Route path="/" element={<LoginPage />} />

<Route path="/app" element={<ProtectedRoute allowedRoles={['admin', 'chef', 'membre']} />}>
    <Route element={<Sidenav />}>
        <Route index element={<Dashboard />} />
        
        {/* Admin only routes */}
        <Route path="GestionProjets" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={<GestionProjets />} />
        </Route>
        <Route path="GestionEquipe" element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route index element={<GestionEquipe />} />
        </Route>
        
        {/* Chef only route */}
        <Route path="TaskMembers" element={<ProtectedRoute allowedRoles={['chef']} />}>
            <Route index element={<ProjectMembersTasksManager />} />
        </Route>
        
        {/* Member only route */}
        <Route path="UserTasks" element={<ProtectedRoute allowedRoles={['membre']} />}>
            <Route index element={<UserTasks />} />
        </Route>

        {/* Routes accessible to all roles */}
        <Route path="CalendarPage" element={<CalendarPage />} />
        <Route path="UserProjects" element={<UserProjectsTable />} />

    </Route>
                </Route>

                {/* You can also protect these if needed */}
                <Route path="/chef" element={<ProtectedRoute allowedRoles={['chef']} />}>
                    <Route index element={<ChefDashboard />} />
                </Route>
                <Route path="/member" element={<ProtectedRoute allowedRoles={['membre']} />}>
                    <Route index element={<MemberDashboard />} />
</Route>
            </Routes>
        </Router>
    );
}

export default App;
