import React, { useState, useEffect } from 'react';
import {
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    Chip,
    Typography,
    TextField,
    InputAdornment,
    IconButton,
    TablePagination,
    Tooltip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import {
    Search as SearchIcon,
    FilterList as FilterIcon,
    Refresh as RefreshIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
    Add as AddIcon
} from '@mui/icons-material';
import axios from 'axios';

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
    const [chefs, setChefs] = useState([]);

    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [projectToDelete, setProjectToDelete] = useState(null);

    useEffect(() => {
        fetchProjets();
        // eslint-disable-next-line
    }, []);

    const fetchChefs = async () => {
        try {
            const res = await axios.get('http://localhost:5035/api/User/AllChefs');
            setChefs(res.data.filter(u => u.role?.toLowerCase() === 'chef'));
        } catch {
            setChefs([]);
        }
    };

    const [openAddDialog, setOpenAddDialog] = useState(false);
    const [newProject, setNewProject] = useState({
        title: '',
        description: '',
        chefId: ''
    });

    const handleOpenDialog = (projet) => {
        setSelectedProject(projet);
        setEditTitle(projet.title);
        setEditDescription(projet.description);
        setEditChefId(projet.chefId);
        fetchChefs();
        setOpenDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setSelectedProject(null);
    };

    const handleOpenAddDialog = () => {
        setNewProject({ title: '', description: '', chefId: '' });
        fetchChefs();
        setOpenAddDialog(true);
    };

    const handleCloseAddDialog = () => {
        setOpenAddDialog(false);
    };

    const handleAddProject = async () => {
        if (!newProject.title || !newProject.chefId) {
            alert("Le titre et le chef de projet sont requis.");
            return;
        }
        try {
            await axios.post('http://localhost:5035/api/project/AddProject', {
                title: newProject.title,
                description: newProject.description,
                chefId: newProject.chefId
            });
            setOpenAddDialog(false);
            fetchProjets();
        } catch (error) {
            alert("Erreur lors de l'ajout du projet");
        }
    };


    const handleUpdateProject = async () => {
        if (!selectedProject) return;
        try {
            await axios.put(
                `http://localhost:5035/api/project/UpdateProject/${selectedProject.projectId}`,
                {
                    projectId: selectedProject.projectId,
                    title: editTitle,
                    description: editDescription,
                    chefId: editChefId
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
            setProjets(response.data); // No need for .data.$values
        } catch (error) {
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

    return (
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <Typography variant="h6" gutterBottom>
                    Liste des Projets
                </Typography>
                <div>
                    <TextField
                        variant="outlined"
                        size="small"
                        placeholder="Rechercher..."
                        value={searchTerm}
                        onChange={handleSearch}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                        sx={{ mr: 2, width: 250 }}
                    />
                    <Tooltip title="Filtrer">
                        <IconButton>
                            <FilterIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Actualiser">
                        <IconButton onClick={fetchProjets}>
                            <RefreshIcon />
                        </IconButton>
                    </Tooltip>
                    <Tooltip title="Ajouter un projet">
                        <IconButton color="success" onClick={handleOpenAddDialog}>
                            <AddIcon />
                        </IconButton>
                    </Tooltip>
                </div>
            </div>

            <Dialog open={openAddDialog} onClose={handleCloseAddDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Ajouter un projet</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Titre"
                        value={newProject.title}
                        onChange={e => setNewProject({ ...newProject, title: e.target.value })}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Description"
                        value={newProject.description}
                        onChange={e => setNewProject({ ...newProject, description: e.target.value })}
                        fullWidth
                        margin="normal"
                        multiline
                        minRows={2}
                    />
                    <FormControl fullWidth margin="normal">
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseAddDialog}>Annuler</Button>
                    <Button variant="contained" color="success" onClick={handleAddProject}>
                        Ajouter
                    </Button>
                </DialogActions>
            </Dialog>

            <TableContainer>
                <Table>
                    <TableHead>
                        <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                            <TableCell sx={{ fontWeight: 'bold' }}>Titre</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Description</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Chef de Projet</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Membres</TableCell>
                            <TableCell sx={{ fontWeight: 'bold' }}>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    Chargement en cours...
                                </TableCell>
                            </TableRow>
                        ) : filteredProjets.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} align="center">
                                    Aucun projet trouvé
                                </TableCell>
                            </TableRow>
                        ) : (
                            filteredProjets
                                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                .map((projet) => (
                                    <TableRow key={projet.projectId} hover>
                                        <TableCell>{projet.title}</TableCell>
                                        <TableCell>
                                            <Tooltip title={projet.description || ''}>
                                                <span style={{
                                                    display: '-webkit-box',
                                                    WebkitLineClamp: 2,
                                                    WebkitBoxOrient: 'vertical',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    maxWidth: '200px'
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
                                            />
                                        </TableCell>
                                        <TableCell>
                                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', maxWidth: '250px' }}>
                                            {projet.userProjects?.map((userProject, idx) => (
                                                    <Chip
                                                        key={userProject.userId || idx}
                                                        label={userProject.user?.email || '-'}
                                                        size="small"
                                                        sx={{ mb: 0.5 }}
                                                    />
                                                ))}
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Tooltip title="Modifier">
                                                <IconButton color="primary" onClick={() => handleOpenDialog(projet)}>
                                                    <EditIcon />
                                                </IconButton>
                                            </Tooltip>
                                            <Tooltip title="Supprimer">
                                                <IconButton color="error" onClick={() => handleOpenDeleteDialog(projet)}>
                                                    <DeleteIcon />
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>
                                    </TableRow>
                                ))
                        )}
                        {emptyRows > 0 && (
                            <TableRow style={{ height: 53 * emptyRows }}>
                                <TableCell colSpan={5} />
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
            />

            {/* Edit Dialog */}
            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Modifier le projet</DialogTitle>
                <DialogContent>
                    <TextField
                        label="Titre"
                        value={editTitle}
                        onChange={e => setEditTitle(e.target.value)}
                        fullWidth
                        margin="normal"
                    />
                    <TextField
                        label="Description"
                        value={editDescription}
                        onChange={e => setEditDescription(e.target.value)}
                        fullWidth
                        margin="normal"
                        multiline
                        minRows={2}
                    />
                    <FormControl fullWidth margin="normal">
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
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Annuler</Button>
                    <Button variant="contained" onClick={handleUpdateProject} color="primary">
                        Mettre à jour
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                    Êtes-vous sûr de vouloir supprimer le projet{' '}
                    <b>{projectToDelete?.title}</b> ?
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
                    <Button variant="contained" color="error" onClick={handleDeleteProject}>
                        Supprimer
                    </Button>
                </DialogActions>
            </Dialog>
        </Paper>
    );
};

export default GestionProjets;