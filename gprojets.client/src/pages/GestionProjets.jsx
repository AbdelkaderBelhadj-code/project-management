import React, { useState, useEffect, useRef } from 'react';
import {
    Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
    Paper, Chip, Typography, TextField, InputAdornment, IconButton,
    TablePagination, Tooltip, Dialog, DialogTitle, DialogContent,
    DialogActions, Button, FormControl, InputLabel, Select, MenuItem,
    Grid, Box, Snackbar, Badge, List, ListItem, ListItemText, Divider
} from '@mui/material';

import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon,
    Notifications as NotificationsIcon // <-- NEW
} from '@mui/icons-material';

import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';

import dayjs from 'dayjs';
import axios from 'axios';
import minMax from 'dayjs/plugin/minMax';

import * as signalR from '@microsoft/signalr';

dayjs.extend(minMax);

const formatDate = (date) => {
    if (!date) return '';
    return dayjs(date).format('DD/MM/YYYY');
};

const statusColors = {
    "En cours": "#1976d2",
    "En attente": "#fbc02d",
    "Terminée": "#388e3c",
};

const statusNames = Object.keys(statusColors);

const GestionProjets = () => {
    const [projets, setProjets] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [openDialog, setOpenDialog] = useState(false);
    const [selectedProject, setSelectedProject] = useState(null);
    const [editTitle, setEditTitle] = useState('');
    const [editDescription, setEditDescription] = useState('');
    const [editChefId, setEditChefId] = useState('');
    const [editDateDebut, setEditDateDebut] = useState(null);
    const [editDateFin, setEditDateFin] = useState(null);
    const [chefs, setChefs] = useState([]);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        chefId: '',
        dateDebut: null,
        dateFin: null,
    });
    const [selectedGanttProject, setSelectedGanttProject] = useState(null);

    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const [notificationMessage, setNotificationMessage] = useState('');

    const connection = useRef(null);

    // --- NEW for Bell/Notifications ---
    const [notifications, setNotifications] = useState([]); // Array of notif objects
    const [unreadCount, setUnreadCount] = useState(0);
    const [notifDialogOpen, setNotifDialogOpen] = useState(false);

    useEffect(() => {
        fetchProjets();

        const token = localStorage.getItem('token');

        connection.current = new signalR.HubConnectionBuilder()
            .withUrl("http://localhost:5035/notifications", {
                accessTokenFactory: () => token || ''
            })
            .withAutomaticReconnect()
            .build();

        connection.current.start()
            .then(() => {
                console.log("SignalR connected.");
            })
            .catch(err => {
                console.error("SignalR Connection Error: ", err);
            });

        connection.current.on("ReceiveNotification", (message) => {
            setNotificationMessage(message);
            setSnackbarOpen(true);

            // --- NEW: Add notification to list and increment unread count ---
            setNotifications(prev => [
                { id: Date.now(), message, date: new Date() },
                ...prev.slice(0, 29) // keep max 30
            ]);
            setUnreadCount(prev => prev + 1);

            fetchProjets(); // Optional: reload
        });

        return () => {
            if (connection.current) {
                connection.current.stop();
            }
        };
    }, []);

    const handleSnackbarClose = (event, reason) => {
        if (reason === 'clickaway') return;
        setSnackbarOpen(false);
    };

    // --- NEW: Notification Dialog Handlers ---
    const handleOpenNotifDialog = () => {
        setNotifDialogOpen(true);
        setUnreadCount(0); // Mark as read
    };
    const handleCloseNotifDialog = () => setNotifDialogOpen(false);

    // --- GanttChart ---
    const GanttChart = ({ taches, dateDebut, dateFin }) => {
        if (!taches || taches.length === 0) return <Typography color="text.secondary">Aucune tâche pour ce projet.</Typography>;
        const minDate = dayjs.min([dayjs(dateDebut), ...taches.map(t => dayjs(t.dateDebut))]);
        const maxDate = dayjs.max([dayjs(dateFin), ...taches.map(t => dayjs(t.dateFin))]);
        const totalDays = maxDate.diff(minDate, 'day') + 1;

        return (
            <Box sx={{
                overflowX: 'auto',
                background: "#f9fbfd",
                border: "1px solid #e0e7ef",
                borderRadius: 2,
                p: 2,
                mb: 2,
                boxShadow: 2,
                minHeight: 120
            }}>
                {/* Status legend */}
                <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
                    {statusNames.map(name => (
                        <Box key={name} sx={{ display: 'flex', alignItems: 'center', mr: 2 }}>
                            <Box sx={{
                                width: 18, height: 12, borderRadius: 1, background: statusColors[name], mr: 1, boxShadow: 1
                            }} />
                            <Typography variant="caption" color="text.secondary">{name}</Typography>
                        </Box>
                    ))}
                </Box>
                {/* Header */}
                <Box sx={{ display: 'flex', mb: 1, alignItems: 'center', borderBottom: '1.5px solid #e0e7ef', pb: 0.5 }}>
                    <Box sx={{ minWidth: 160, fontWeight: 700, fontSize: 15, color: "primary.main" }}>Tâche</Box>
                    <Box sx={{ flex: 1, display: 'flex', background: "#f1f6fa", borderRadius: 1, overflow: 'hidden' }}>
                        {Array.from({ length: totalDays }).map((_, i) => (
                            <Box
                                key={i}
                                sx={{
                                    flex: 1,
                                    textAlign: 'center',
                                    fontSize: 12,
                                    color: "#99a",
                                    borderLeft: i !== 0 ? '1px solid #e0e7ef' : 'none',
                                    py: 0.2,
                                    backgroundColor: i % 2 ? '#f7fbff' : '#f1f6fa'
                                }}
                            >
                                {minDate.add(i, 'day').format("DD/MM")}
                            </Box>
                        ))}
                    </Box>
                </Box>
                {taches.map(tache => {
                    const start = dayjs(tache.dateDebut);
                    const end = dayjs(tache.dateFin);
                    const startOffset = start.diff(minDate, 'day');
                    const duration = Math.max(1, end.diff(start, 'day') + 1);

                    return (
                        <Box key={tache.tacheId} sx={{
                            display: 'flex',
                            alignItems: 'center',
                            mb: 1,
                            '&:hover': { background: '#f4fafd', borderRadius: 1 }
                        }}>
                            <Box sx={{
                                minWidth: 160,
                                pr: 1,
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                fontWeight: 500,
                                color: "#444"
                            }}>
                                <Tooltip title={tache.description || ''}>
                                    <span>
                                        <b>{tache.title}</b> <span style={{ color: "#888", fontSize: 12 }}>({tache.assignedTo?.email || "-"})</span>
                                    </span>
                                </Tooltip>
                            </Box>
                            <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', height: 28 }}>
                                {startOffset > 0 && <Box sx={{ flex: startOffset, height: 10 }} />}
                                <Box
                                    sx={{
                                        flex: duration,
                                        height: 18,
                                        borderRadius: 2,
                                        background: statusColors[tache.status] || "#90caf9",
                                        boxShadow: 2,
                                        display: 'flex',
                                        alignItems: 'center',
                                        px: 1.2,
                                        color: "#fff",
                                        fontWeight: 600,
                                        fontSize: 13,
                                        minWidth: 32,
                                        marginLeft: startOffset > 0 ? '1px' : 0,
                                        outline: '2px solid #fff'
                                    }}
                                >
                                    {tache.status}
                                </Box>
                                {totalDays - startOffset - duration > 0 && (
                                    <Box sx={{ flex: totalDays - startOffset - duration }} />
                                )}
                            </Box>
                        </Box>
                    );
                })}
            </Box>
        );
    };

    const fetchChefs = async () => {
        try {
            const res = await axios.get('http://localhost:5035/api/User/AllChefs');
            setChefs(res.data.filter(u => u.role?.toLowerCase() === 'chef'));
        } catch {
            setChefs([]);
        }
    };

    const handleOpenDialog = (projet) => {
        setSelectedProject(projet);
        setEditTitle(projet.title);
        setEditDescription(projet.description);
        setEditChefId(projet.chefId);
        setEditDateDebut(projet.dateDebut ? dayjs(projet.dateDebut) : null);
        setEditDateFin(projet.dateFin ? dayjs(projet.dateFin) : null);
        fetchChefs();
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProject(null);
    };

    const handleOpenAddDialog = () => {
        setNewProject({
            title: '',
            description: '',
            chefId: '',
            dateDebut: null,
            dateFin: null
        });
        fetchChefs();
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
    };

    const handleAddProject = async () => {
        const { title, chefId, dateDebut, dateFin } = newProject;
        if (!title || !chefId || !dateDebut || !dateFin) {
            alert("Le titre, le chef et les dates sont requis.");
            return;
        }
        if (dayjs(dateDebut).isAfter(dayjs(dateFin))) {
            alert("La date de début doit être avant la date de fin.");
            return;
        }
        try {
            await axios.post('http://localhost:5035/api/project/AddProject', {
                title: newProject.title,
                description: newProject.description,
                chefId: newProject.chefId,
                dateDebut: dayjs(newProject.dateDebut).toISOString(),
                dateFin: dayjs(newProject.dateFin).toISOString()
            });
            setOpenAddDialog(false);
            fetchProjets();
        } catch (error) {
            alert("Erreur lors de l'ajout du projet");
        }
    };

    const handleUpdateProject = async () => {
        if (!selectedProject) return;
        if (!editTitle || !editChefId || !editDateDebut || !editDateFin) {
            alert("Le titre, le chef et les dates sont requis.");
            return;
        }
        if (dayjs(editDateDebut).isAfter(dayjs(editDateFin))) {
            alert("La date de début doit être avant la date de fin.");
            return;
        }
        try {
            await axios.put(
                `http://localhost:5035/api/project/UpdateProject/${selectedProject.projectId}`,
                {
                    projectId: selectedProject.projectId,
                    title: editTitle,
                    description: editDescription,
                    chefId: editChefId,
                    dateDebut: dayjs(editDateDebut).toISOString(),
                    dateFin: dayjs(editDateFin).toISOString()
                }
            );
            fetchProjets();
            handleCloseDialog();
        } catch (error) {
            alert('Erreur lors de la mise à jour du projet');
        }
    };

    const fetchProjets = async () => {
        try {
            setLoading(true);
            const response = await axios.get('http://localhost:5035/api/project/all');
            setProjets(response.data);
        } catch {
            setProjets([]);
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDeleteDialog = (projet) => {
        setProjectToDelete(projet);
        setOpenDeleteDialog(true);
    };

    const handleCloseDeleteDialog = () => {
        setOpenDeleteDialog(false);
        setProjectToDelete(null);
    };

    const handleDeleteProject = async () => {
        try {
            await axios.delete(`http://localhost:5035/api/project/${projectToDelete.projectId}`);
            fetchProjets();
            handleCloseDeleteDialog();
        } catch {
            alert('Erreur lors de la suppression du projet');
        }
    };

    const handleSearch = (e) => {
        setSearchTerm(e.target.value);
        setPage(0);
    };

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    const filteredProjets = projets.filter(projet => {
        const title = projet.title || '';
        const description = projet.description || '';
        const chefEmail = projet.chef?.email || '';
        return (
            title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            chefEmail.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const emptyRows = rowsPerPage - Math.min(rowsPerPage, filteredProjets.length - page * rowsPerPage);
    const handleSelectGanttProject = (projet) => {
        setSelectedGanttProject(projet);
    };

    return (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
            <Paper elevation={6} sx={{
                p: { xs: 1, md: 4 },
                borderRadius: 4,
                background: 'linear-gradient(120deg, #f7faff 0%, #e8f1fa 100%)',
                boxShadow: 6,
                minHeight: '100vh'
            }}>
                {/* Top Title */}
                <Box sx={{ mb: 3, mt: 2, display: 'flex', alignItems: 'center', gap: 2, justifyContent: 'space-between' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                        <AddIcon color="primary" fontSize="large" />
                        <Typography variant="h4" fontWeight="bold" color="primary.dark" sx={{ letterSpacing: 1 }}>
                            Gestion des Projets
                        </Typography>
                    </Box>
                    {/* Bell notification icon */}
                    <Tooltip title="Notifications en temps réel">
                        <IconButton onClick={handleOpenNotifDialog} color={unreadCount > 0 ? "error" : "primary"} sx={{ ml: 2 }}>
                            <Badge badgeContent={unreadCount} color="error" max={99}>
                                <NotificationsIcon fontSize="large" />
                            </Badge>
                        </IconButton>
                    </Tooltip>
                </Box>

                {/* Search and Toolbar */}
                <Box sx={{
                    display: 'flex', flexDirection: { xs: 'column', md: 'row' },
                    justifyContent: 'space-between', alignItems: { xs: 'flex-start', md: 'center' }, mb: 2, gap: 2
                }}>
                    <TextField
                        variant="outlined"
                        size="medium"
                        placeholder="Rechercher par titre, chef, description..."
                        value={searchTerm}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{
                            width: { xs: '100%', md: 340 },
                            background: "#fff",
                            borderRadius: 2,
                            boxShadow: 1
                        }}
                    />
                    <Box>
                        <Tooltip title="Filtrer (à venir)">
                            <span>
                                <IconButton disabled sx={{ mx: 0.5 }}>
                                    <FilterIcon />
                                </IconButton>
                            </span>
                        </Tooltip>
                        <Tooltip title="Actualiser">
                            <IconButton onClick={fetchProjets} sx={{ mx: 0.5 }}>
                                <RefreshIcon />
                            </IconButton>
                        </Tooltip>
                        <Tooltip title="Ajouter un projet">
                            <IconButton color="success" onClick={handleOpenAddDialog} sx={{ mx: 0.5, background: "#e8f5e9", borderRadius: 2 }}>
                                <AddIcon />
                            </IconButton>
                        </Tooltip>
                    </Box>
                </Box>

                {/* Gantt + Project List */}
        

                {/* Table */}
                <TableContainer sx={{
                    borderRadius: 3,
                    boxShadow: 3,
                    background: "#fff"
                }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow sx={{ backgroundColor: '#f5faff' }}>
                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: 16 }}>Titre</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: 16 }}>Description</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: 16 }}>Chef de Projet</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: 16 }} align="center">Date Début</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: 16 }} align="center">Date Fin</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: 16 }}>Membres</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', color: 'primary.main', fontSize: 16 }}>Actions</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {loading ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        <Typography color="primary">Chargement en cours...</Typography>
                                    </TableCell>
                                </TableRow>
                            ) : filteredProjets.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={7} align="center">
                                        Aucun projet trouvé
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredProjets
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((projet) => (
                                        <TableRow
                                            key={projet.projectId}
                                            hover
                                            sx={{
                                                transition: 'background 0.2s',
                                                '&:hover': { background: "#f3fafd" }
                                            }}
                                        >
                                            <TableCell>
                                                <Typography fontWeight={700} color="primary.dark">{projet.title}</Typography>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title={projet.description || ''}>
                                                    <span style={{
                                                        display: '-webkit-box',
                                                        WebkitLineClamp: 2,
                                                        WebkitBoxOrient: 'vertical',
                                                        overflow: 'hidden',
                                                        textOverflow: 'ellipsis',
                                                        maxWidth: '220px',
                                                        color: '#495057'
                                                    }}>
                                                        {projet.description}
                                                    </span>
                                                </Tooltip>
                                            </TableCell>
                                            <TableCell>
                                                <Chip
                                                    label={projet.chef?.email || '-'}
                                                    color="primary"
                                                    size="small"
                                                    variant="outlined"
                                                    sx={{
                                                        fontWeight: 600, fontSize: 13, px: 0.8,
                                                        background: '#e3f2fd'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={formatDate(projet.dateDebut)}
                                                    color="info"
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 500, background: '#e1f5fe', color: '#0288d1'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell align="center">
                                                <Chip
                                                    label={formatDate(projet.dateFin)}
                                                    color="secondary"
                                                    size="small"
                                                    sx={{
                                                        fontWeight: 500, background: '#fce4ec', color: '#c2185b'
                                                    }}
                                                />
                                            </TableCell>
                                            <TableCell>
                                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, maxWidth: '240px' }}>
                                                    {projet.userProjects?.map((userProject, idx) => (
                                                        <Chip
                                                            key={userProject.userId || idx}
                                                            label={userProject.user?.email || '-'}
                                                            size="small"
                                                            sx={{
                                                                mb: 0.5,
                                                                background: '#f7fafd',
                                                                color: "#1a237e"
                                                            }}
                                                        />
                                                    ))}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Tooltip title="Modifier">
                                                    <IconButton color="primary" onClick={() => handleOpenDialog(projet)} sx={{ mx: 0.5 }}>
                                                        <EditIcon />
                                                    </IconButton>
                                                </Tooltip>
                                                <Tooltip title="Supprimer">
                                                    <IconButton color="error" onClick={() => handleOpenDeleteDialog(projet)} sx={{ mx: 0.5 }}>
                                                        <DeleteIcon />
                                                    </IconButton>
                                                </Tooltip>
                                            </TableCell>
                                        </TableRow>
                                    ))
                            )}
                            {emptyRows > 0 && (
                                <TableRow style={{ height: 53 * emptyRows }}>
                                    <TableCell colSpan={7} />
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>

                <TablePagination
                    rowsPerPageOptions={[5, 10, 25]}
                    component="div"
                    count={filteredProjets.length}
                    rowsPerPage={rowsPerPage}
                    page={page}
                    onPageChange={handleChangePage}
                    onRowsPerPageChange={handleChangeRowsPerPage}
                    labelRowsPerPage="Lignes par page:"
                    labelDisplayedRows={({ from, to, count }) => `${from}-${to} sur ${count}`}
                    sx={{
                        background: "#f5faff",
                        borderRadius: 2,
                        mt: 1,
                        boxShadow: 1,
                        px: 2
                    }}
                />

                {/* Ajout Dialog */}
                <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth
                    PaperProps={{
                        sx: { borderRadius: 3, p: 1, background: "#f9f9fb" }
                    }}>
                    <DialogTitle sx={{ fontWeight: 700, color: "primary.main", fontSize: 22 }}>Ajouter un projet</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Titre"
                                    value={newProject.title}
                                    onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Chef de Projet</InputLabel>
                                    <Select
                                        value={newProject.chefId}
                                        label="Chef de Projet"
                                        onChange={e => setNewProject({ ...newProject, chefId: e.target.value })}
                                    >
                                        {chefs.map(chef => (
                                            <MenuItem key={chef.userId} value={chef.userId}>
                                                {chef.email}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Date de Début"
                                    value={newProject.dateDebut}
                                    onChange={date => setNewProject({ ...newProject, dateDebut: date })}
                                    slotProps={{ textField: { fullWidth: true } }}
                                    format="DD/MM/YYYY"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Date de Fin"
                                    value={newProject.dateFin}
                                    onChange={date => setNewProject({ ...newProject, dateFin: date })}
                                    slotProps={{ textField: { fullWidth: true } }}
                                    format="DD/MM/YYYY"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Description"
                                    value={newProject.description}
                                    onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                                    fullWidth
                                    multiline
                                    minRows={2}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ pr: 3, pb: 2 }}>
                        <Button onClick={handleCloseAddDialog} sx={{ fontWeight: 600 }}>Annuler</Button>
                        <Button variant="contained" color="success" onClick={handleAddProject} sx={{ fontWeight: 700 }}>
                            Ajouter
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Edit Dialog */}
                <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth
                    PaperProps={{
                        sx: { borderRadius: 3, p: 1, background: "#f9f9fb" }
                    }}>
                    <DialogTitle sx={{ fontWeight: 700, color: "primary.main", fontSize: 22 }}>Modifier le projet</DialogTitle>
                    <DialogContent>
                        <Grid container spacing={2} sx={{ mt: 1 }}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Titre"
                                    value={editTitle}
                                    onChange={e => setEditTitle(e.target.value)}
                                    fullWidth
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <FormControl fullWidth>
                                    <InputLabel>Chef de Projet</InputLabel>
                                    <Select
                                        value={editChefId}
                                        label="Chef de Projet"
                                        onChange={e => setEditChefId(e.target.value)}
                                    >
                                        {chefs.map(chef => (
                                            <MenuItem key={chef.userId} value={chef.userId}>
                                                {chef.email}
                                            </MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Date de Début"
                                    value={editDateDebut}
                                    onChange={date => setEditDateDebut(date)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                    format="DD/MM/YYYY"
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <DatePicker
                                    label="Date de Fin"
                                    value={editDateFin}
                                    onChange={date => setEditDateFin(date)}
                                    slotProps={{ textField: { fullWidth: true } }}
                                    format="DD/MM/YYYY"
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    label="Description"
                                    value={editDescription}
                                    onChange={e => setEditDescription(e.target.value)}
                                    fullWidth
                                    multiline
                                    minRows={2}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ pr: 3, pb: 2 }}>
                        <Button onClick={handleCloseDialog} sx={{ fontWeight: 600 }}>Annuler</Button>
                        <Button variant="contained" onClick={handleUpdateProject} color="primary" sx={{ fontWeight: 700 }}>
                            Mettre à jour
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Delete Confirmation Dialog */}
                <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}
                    PaperProps={{
                        sx: { borderRadius: 3, p: 1, background: "#fff" }
                    }}>
                    <DialogTitle sx={{ fontWeight: 700, color: "error.main" }}>Confirmer la suppression</DialogTitle>
                    <DialogContent>
                        Êtes-vous sûr de vouloir supprimer le projet{' '}
                        <b>{projectToDelete?.title}</b> ?
                    </DialogContent>
                    <DialogActions sx={{ pr: 3, pb: 2 }}>
                        <Button onClick={handleCloseDeleteDialog} sx={{ fontWeight: 600 }}>Annuler</Button>
                        <Button variant="contained" color="error" onClick={handleDeleteProject} sx={{ fontWeight: 700 }}>
                            Supprimer
                        </Button>
                    </DialogActions>
                </Dialog>

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbarOpen}
                    autoHideDuration={4000}
                    onClose={handleSnackbarClose}
                    message={notificationMessage}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                />

                {/* --- Notification Bell Dialog --- */}
                <Dialog
                    open={notifDialogOpen}
                    onClose={handleCloseNotifDialog}
                    maxWidth="xs"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 3, background: "#f5faff", p: 1 }
                    }}
                >
                    <DialogTitle sx={{ color: 'primary.main', fontWeight: 700, fontSize: 20 }}>
                        Notifications récentes
                    </DialogTitle>
                    <DialogContent dividers>
                        {notifications.length === 0 ? (
                            <Typography color="text.secondary" align="center" sx={{ my: 2 }}>
                                Aucune notification pour le moment.
                            </Typography>
                        ) : (
                            <List dense>
                                {notifications.map((notif, idx) => (
                                    <React.Fragment key={notif.id}>
                                        <ListItem alignItems="flex-start" sx={{ py: 1.2 }}>
                                            <ListItemText
                                                primary={notif.message}
                                                secondary={dayjs(notif.date).format("DD/MM/YYYY HH:mm")}
                                                primaryTypographyProps={{ fontSize: 15, fontWeight: 500 }}
                                                secondaryTypographyProps={{ fontSize: 12, color: "text.secondary" }}
                                            />
                                        </ListItem>
                                        {idx < notifications.length - 1 && <Divider component="li" />}
                                    </React.Fragment>
                                ))}
                            </List>
                        )}
                    </DialogContent>
                    <DialogActions sx={{ pr: 2, pb: 1 }}>
                        <Button onClick={handleCloseNotifDialog} color="primary" sx={{ fontWeight: 600 }}>
                            Fermer
                        </Button>
                    </DialogActions>
                </Dialog>
            </Paper>
        </LocalizationProvider>
    );
};

export default GestionProjets;