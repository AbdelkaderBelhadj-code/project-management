import React, { useState, useEffect } from 'react';
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import axios from 'axios';
import GanttChart from './GanttChart.jsx';

export default function Dashboard() {
    const [userRole, setUserRole] = useState('');
    const [userId, setUserId] = useState('');
    const [projects, setProjects] = useState([]);
    const [selectedProject, setSelectedProject] = useState(null);
    const [memberTasks, setMemberTasks] = useState([]);

    // 1. Get user role and userId from token
    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const payload = JSON.parse(atob(token.split('.')[1]));
                setUserRole(payload.Role || payload.role || '');
                setUserId(payload.UserId || payload.sub || ''); // Adjust key depending on your token structure
            } catch (e) {
                setUserRole('');
                setUserId('');
            }
        }
    }, []);

    // 2. Fetch all projects (for admin)
    useEffect(() => {
        if (userRole.toLowerCase() === 'admin') {
            axios.get('http://localhost:5035/api/Project/All')
                .then(res => {
                    setProjects(res.data);
                    if (res.data.length > 0) setSelectedProject(res.data[0]);
                })
                .catch(() => setProjects([]));
        }
    }, [userRole]);

    // 3. Fetch member's tasks
    useEffect(() => {
        const fetchMemberTasks = async () => {
            try {
                const res = await axios.get(`http://localhost:5035/api/Project/UserTasks/${userId}`);
                setMemberTasks(res.data || []);
            } catch (err) {
                console.error("Erreur lors du chargement des tâches du membre", err);
                setMemberTasks([]);
            }
        };

        if (userId && userRole.toLowerCase() === 'member') {
            fetchMemberTasks();
        }
    }, [userId, userRole]);

    const handleSelectProject = (project) => setSelectedProject(project);

    return (
        <Box sx={{ display: 'flex' }}>
            <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
                <Typography variant="h4" sx={{ mb: 3 }}>
                    Dashboard
                </Typography>

                {/* Membres view */}
                {userRole.toLowerCase() === 'member' && (
    <Box
    sx={{
        backgroundColor: '#f9f9f9',
        borderRadius: 3,
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        p: 3,
        mb: 4,
        border: '1px solid #e0e0e0'
    }}
>
    <Typography variant="h5" sx={{ mb: 2, fontWeight: 600, color: '#1976d2' }}>
        Vos Tâches
    </Typography>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        Visualisez vos tâches sous forme de diagramme de Gantt.
    </Typography>
    <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <GanttChart
            taches={memberTasks}
            dateDebut={memberTasks.length > 0 ? memberTasks[0].dateDebut : null}
            dateFin={memberTasks.length > 0 ? memberTasks[memberTasks.length - 1].dateFin : null}
        />
    </Box>
</Box>
                )}

                {/* Admin view */}
                {userRole.toLowerCase() === 'admin' && (
                    <Box>
                        <Typography variant="h6" sx={{ mb: 2 }}>
                            Diagramme de Gantt (Admin)
                        </Typography>
                        <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
                            {projects.map((project) => (
                                <Box
                                    key={project.projectId}
                                    sx={{
                                        p: 1,
                                        borderRadius: 2,
                                        cursor: 'pointer',
                                        border: selectedProject?.projectId === project.projectId ? '2px solid #1976d2' : '1px solid #eee',
                                        background: selectedProject?.projectId === project.projectId ? '#e3f2fd' : '#fff',
                                        fontWeight: selectedProject?.projectId === project.projectId ? 700 : 500,
                                        transition: 'all .1s'
                                    }}
                                    onClick={() => handleSelectProject(project)}
                                >
                                    {project.title}
                                </Box>
                            ))}
                        </Box>
                        {selectedProject ? (
                            <>
                                <Typography variant="subtitle2" color="primary">
                                    Projet: <b>{selectedProject.title}</b>
                                </Typography>
                                <GanttChart
                                    taches={selectedProject.taches}
                                    dateDebut={selectedProject.dateDebut}
                                    dateFin={selectedProject.dateFin}
                                />
                            </>
                        ) : (
                            <Typography color="text.secondary">Aucun projet sélectionné.</Typography>
                        )}
                    </Box>
                )}
            </Box>
        </Box>
    );
}
