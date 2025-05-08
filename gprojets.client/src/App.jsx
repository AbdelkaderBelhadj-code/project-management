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
import Chat from './pages/Chat';

const getToken = () => localStorage.getItem('token');

function App() {
    return (
        <Router>
            <Routes>
                {/* Public Route */}
                <Route path="/" element={<LoginPage />} />

                {/* Protected main app routes for all authenticated roles */}
                <Route element={<ProtectedRoute allowedRoles={['admin', 'chef', 'membre', 'member']} />}>
                    <Route path="/app" element={<Sidenav />}>
                        <Route index element={<Dashboard />} />

                        {/* Admin only routes */}
                        <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                            <Route path="GestionProjets" element={<GestionProjets />} />
                            <Route path="GestionEquipe" element={<GestionEquipe />} />
                        </Route>

                        {/* Chef only route */}
                        <Route element={<ProtectedRoute allowedRoles={['chef']} />}>
                            <Route path="TaskMembers" element={<ProjectMembersTasksManager />} />
                            <Route path="chef-dashboard" element={<ChefDashboard />} />
                        </Route>

                        {/* Member only route */}
                        <Route element={<ProtectedRoute allowedRoles={['member', 'membre']} />}>
                            <Route path="UserTasks" element={<UserTasks />} />
                            <Route path="member-dashboard" element={<MemberDashboard />} />
                        </Route>

                        {/* Unified group chat for all roles */}
                        <Route path="chat" element={<Chat jwt={getToken()} />} />

                        {/* Routes accessible to all roles */}
                        <Route path="CalendarPage" element={<CalendarPage />} />
                        <Route path="UserProjects" element={<UserProjectsTable />} />
                    </Route>
                </Route>

                {/* Legacy direct dashboard routes (optional) */}
                <Route element={<ProtectedRoute allowedRoles={['chef']} />}>
                    <Route path="/chef" element={<ChefDashboard />} />
                </Route>
                <Route element={<ProtectedRoute allowedRoles={['membre', 'member']} />}>
                    <Route path="/member" element={<MemberDashboard />} />
                </Route>
            </Routes>
        </Router>
    );
}

export default App;