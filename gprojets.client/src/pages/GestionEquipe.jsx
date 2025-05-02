// src/pages/GestionEquipe.jsx

import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import { Add as AddIcon } from '@mui/icons-material';
import { toast, Toaster } from 'react-hot-toast';
import {
    Box, Button, Chip, CircularProgress, IconButton, Modal, Paper,
    Table, TableBody, TableCell, TableContainer, TableHead, TablePagination,
    TableRow, TextField, Toolbar, Typography, MenuItem, Fade, Backdrop
} from '@mui/material';
import { Search, Plus, Pencil, Trash2 } from 'lucide-react';
import '../styles/GestionEquipe.css'; // Assure-toi que ce fichier existe

const modalStyle = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%)',
    width: 460,
    bgcolor: 'background.paper',
    borderRadius: 4,
    boxShadow: 24,
    p: 4,
    outline: 'none',
};

const roles = [
    { value: 'admin', label: 'Administrateur' },
    { value: 'chef', label: 'Chef de projet' },
    { value: 'membre', label: 'Membre' },
];

const GestionEquipe = () => {
    const [users, setUsers] = useState([]);
    const [formData, setFormData] = useState({
        firstName: '', lastName: '', email: '',
        password: '', confirmPassword: '', role: '',
        originalEmail: ''
    });
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    const [loading, setLoading] = useState(false);
    const [modalMode, setModalMode] = useState('add');
    const [modalOpen, setModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const fetchUsers = useCallback(async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5035/api/User');
            // Normalize: handle if result is { $values: Array }
            if (Array.isArray(res.data)) {
                setUsers(res.data);
            } else if (res.data && Array.isArray(res.data.$values)) {
                setUsers(res.data.$values);
            } else {
                setUsers([]); // fallback
            }
        } catch {
            toast.error("Erreur lors du chargement des utilisateurs");
            setUsers([]); // fallback on error
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleOpenAdd = () => {
        setFormData({
            firstName: '', lastName: '', email: '',
            password: '', confirmPassword: '', role: '',
            originalEmail: ''
        });
        setModalMode('add');
        setModalOpen(true);
    };

    const handleOpenEdit = (user) => {
        setFormData({
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            role: user.role,
            password: '',
            confirmPassword: '',
            originalEmail: user.email
        });
        setModalMode('edit');
        setModalOpen(true);
    };

    const handleCloseModal = () => {
        setModalOpen(false);
    };

    const handleDelete = async (email) => {
        if (!window.confirm("Confirmer la suppression ?")) return;
        try {
            await axios.delete(`http://localhost:5035/api/User/${email}`);
            toast.success("Utilisateur supprimé");
            fetchUsers();
        } catch {
            toast.error("Erreur de suppression");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (modalMode === 'add') {
            if (formData.password !== formData.confirmPassword) {
                toast.error("Les mots de passe ne correspondent pas");
                return;
            }
            try {
                await axios.post('http://localhost:5035/api/User/AddUser', formData);
                toast.success("Utilisateur ajouté");
            } catch {
                toast.error("Erreur d'ajout");
            }
        } else {
            try {
                const updatedUser = {
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    email: formData.email,
                    role: formData.role
                };
                await axios.put(`http://localhost:5035/api/User/${formData.originalEmail}`, updatedUser);
                toast.success("Utilisateur mis à jour");
            } catch {
                toast.error("Erreur lors de la mise à jour");
            }
        }
        fetchUsers();
        handleCloseModal();
    };

    const filteredUsers = users.filter((user) =>
        user.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleChangePage = (event, newPage) => {
        setPage(newPage);
    };

    const handleChangeRowsPerPage = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0);
    };

    return (
        <Box sx={{ p: 1 }}>
            <Toaster position="top-right" />

            <Toolbar sx={{ justifyContent: 'space-between', mb: 2 }}>

                <TextField
                    variant="outlined"
                    size="small"
                    placeholder="Rechercher..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    InputProps={{
                        startAdornment: <Search size={20} />,
                    }}
                />
                <Button variant="contained" startIcon={<Plus />} onClick={handleOpenAdd}>
                    Ajouter
                </Button>
            </Toolbar>

            {/* Petit espace */}
            <Box sx={{ height: 0 }} />

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Paper sx={{ mt: 1 }}>
                    {/* Scroll sur la Table */}
                    <TableContainer sx={{ maxHeight: 240 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell>Prénom</TableCell>
                                    <TableCell>Nom</TableCell>
                                    <TableCell>Email</TableCell>
                                    <TableCell>Rôle</TableCell>
                                    <TableCell align="center">Actions</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredUsers
                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                    .map((user) => (
                                        <TableRow key={user.email}>
                                            <TableCell>{user.firstName}</TableCell>
                                            <TableCell>{user.lastName}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <Chip label={roles.find(r => r.value === user.role)?.label || user.role} />
                                            </TableCell>
                                            <TableCell align="center">
                                                <IconButton color="primary" onClick={() => handleOpenEdit(user)}>
                                                    <Pencil size={18} />
                                                </IconButton>
                                                <IconButton color="error" onClick={() => handleDelete(user.email)}>
                                                    <Trash2 size={18} />
                                                </IconButton>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                {filteredUsers.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} align="center">
                                            Aucun utilisateur trouvé
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>

                    {/* Pagination */}
                    <TablePagination
                        component="div"
                        count={filteredUsers.length}
                        page={page}
                        onPageChange={handleChangePage}
                        rowsPerPage={rowsPerPage}
                        onRowsPerPageChange={handleChangeRowsPerPage}
                        rowsPerPageOptions={[5, 10, 20]}
                    />
                </Paper>
            )}

            {/* Modal d'ajout / édition */}
            <Modal
                open={modalOpen}
                onClose={handleCloseModal}
                closeAfterTransition
                slots={{ backdrop: Backdrop }}
                slotProps={{
                    backdrop: { timeout: 400 },
                }}
            >
                <Fade in={modalOpen}>
                    <Box sx={modalStyle}>
                        <Typography variant="h6" mb={1}>
                            {modalMode === 'add' ? "Ajouter un utilisateur" : "Modifier l'utilisateur"}
                        </Typography>
                        <form onSubmit={handleSubmit}>
                            <TextField
                                label="Prénom"
                                name="firstName"
                                fullWidth
                                margin="normal"
                                value={formData.firstName}
                                onChange={handleChange}
                            />
                            <TextField
                                label="Nom"
                                name="lastName"
                                fullWidth
                                margin="normal"
                                value={formData.lastName}
                                onChange={handleChange}
                            />
                            <TextField
                                label="Email"
                                name="email"
                                type="email"
                                fullWidth
                                margin="normal"
                                value={formData.email}
                                onChange={handleChange}
                            />
                            {modalMode === 'add' && (
                                <>
                                    <TextField
                                        label="Mot de passe"
                                        name="password"
                                        type="password"
                                        fullWidth
                                        margin="normal"
                                        value={formData.password}
                                        onChange={handleChange}
                                    />
                                    <TextField
                                        label="Confirmer mot de passe"
                                        name="confirmPassword"
                                        type="password"
                                        fullWidth
                                        margin="normal"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                    />
                                </>
                            )}
                            <TextField
                                select
                                label="Rôle"
                                name="role"
                                fullWidth
                                margin="normal"
                                value={formData.role}
                                onChange={handleChange}
                            >
                                {roles.map((role) => (
                                    <MenuItem key={role.value} value={role.value}>
                                        {role.label}
                                    </MenuItem>
                                ))}
                            </TextField>

                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                                <Button onClick={handleCloseModal} sx={{ mr: 1 }}>Annuler</Button>
                                <Button type="submit" variant="contained">
                                    {modalMode === 'add' ? "Ajouter" : "Modifier"}
                                </Button>
                            </Box>
                        </form> 
                    </Box>
                </Fade>
            </Modal>
        </Box>
    );
};

export default GestionEquipe;
