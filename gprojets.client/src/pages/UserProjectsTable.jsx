import React, { useEffect, useState } from "react";
import { jwtDecode } from 'jwt-decode';
import axios from "axios";
import Autocomplete from '@mui/material/Autocomplete';

import {
  Table, TableHead, TableBody, TableRow, TableCell,
  Paper, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, IconButton, Typography, Box
} from "@mui/material";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import DeleteIcon from "@mui/icons-material/Delete";

// 👉 Adapte cette URL à celle de ton backend
const API_URL = "http://localhost:5035/api";

function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return {
      userId: decoded.UserId || decoded.userId,
      role: decoded.role || decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      email: decoded.email,
    };
  } catch {
    return null;
  }
}

const UserProjectsTable = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState(null);
  const [newMemberId, setNewMemberId] = useState("");
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(false);

  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);


  const user = getUserFromToken();

  // Adapter les données retournées par le backend (en .NET il y a $id/$values avec Newtonsoft.Json)
  function normalizeProjects(data) {
    if (!data?.$values) return [];
    return data.$values.map(p => ({
      ...p,
      userProjects: p.userProjects?.$values ?? [],
      taches: p.taches?.$values ?? [],
    }));
  }

  useEffect(() => {
    if (user?.userId)
      fetchProjects();
    // eslint-disable-next-line
  }, [user?.userId, refresh]);


  function normalizeMembers(data) {
    if (!data?.$values) return [];
    return data.$values.map(m => ({
      userId: m.userId,
      firstName: m.firstName,
      lastName: m.lastName,
      email: m.email,
      // add other fields if needed
    }));
  }
  


  async function fetchMembers() {
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/User/Members`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const normalized = normalizeMembers(res.data);
      setMembers(normalized);
    } catch (e) {
      setMembers([]);
    }
  }
  

  async function fetchProjects() {
    setLoading(true);
    setError("");
    try {
      const token = localStorage.getItem("token");
      const res = await axios.get(`${API_URL}/Project/${user.userId}/Projects`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProjects(normalizeProjects(res.data));
    } catch (e) {
      setError("Erreur lors du chargement des projets.");
    }
    setLoading(false);
  }

  function handleOpenDialog(projectId) {
    setSelectedProjectId(projectId);
    setOpenDialog(true);
    fetchMembers();
  }

  function handleCloseDialog() {
    setOpenDialog(false);
    setNewMemberId("");
    setSelectedProjectId(null);
  }

  async function handleAddMember() {
    if (!selectedMember) return;
    try {
      const token = localStorage.getItem("token");
      await axios.post(`${API_URL}/Project/${selectedProjectId}/AddMember/${selectedMember.userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefresh(r => !r);
      handleCloseDialog();
    } catch (e) {
      alert(e.response?.data?.message || "Erreur lors de l'ajout du membre.");
    }
  }

  async function handleRemoveMember(projectId, userId) {
    if (!window.confirm("Retirer ce membre du projet ?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/Project/${projectId}/RemoveMember/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setRefresh(r => !r);
    } catch (e) {
      alert(e.response?.data?.message || "Erreur lors de la suppression du membre.");
    }
  }

  return (
    <Box sx={{ maxWidth: 1100, margin: "auto", mt: 3 }}>
      <Typography variant="h4" gutterBottom>Mes Projets</Typography>
      {loading && <Typography>Chargement...</Typography>}
      {error && <Typography color="error">{error}</Typography>}

      <Paper elevation={3} sx={{ overflowX: "auto" }}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Titre</TableCell>
              <TableCell>Description</TableCell>
              <TableCell>Chef</TableCell>
              <TableCell>Membres</TableCell>
              <TableCell>Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {projects.length === 0 && !loading &&
              <TableRow>
                <TableCell colSpan={5} align="center">Aucun projet associé.</TableCell>
              </TableRow>
            }
            {projects.map(proj => (
              <TableRow key={proj.projectId}>
                <TableCell>{proj.title}</TableCell>
                <TableCell>{proj.description}</TableCell>
                <TableCell>
                  {proj.chef?.firstName} {proj.chef?.lastName} ({proj.chef?.email})
                </TableCell>
                <TableCell>
                  {proj.userProjects.length === 0 ?
                    <Typography variant="caption" color="text.secondary">Aucun membre</Typography> :
                    <ul style={{ margin: 0, paddingLeft: 18 }}>
                      {proj.userProjects.map(up => (
                        <li key={up.userId} style={{ display: "flex", alignItems: "center" }}>
                          <span>
                            {up.user?.firstName} {up.user?.lastName} ({up.user?.email})
                          </span>
                          <IconButton
                            size="small"
                            color="error"
                            title="Retirer ce membre"
                            sx={{ ml: 1 }}
                            onClick={() => handleRemoveMember(proj.projectId, up.userId)}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </li>
                      ))}
                    </ul>
                  }
                </TableCell>
                <TableCell>
                  <Button
                    variant="outlined"
                    size="small"
                    startIcon={<PersonAddIcon />}
                    onClick={() => handleOpenDialog(proj.projectId)}
                  >
                    Ajouter membre
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Paper>

      {/* Dialog pour ajouter un membre */}
      <Dialog open={openDialog} onClose={handleCloseDialog}>
        <DialogTitle>Ajouter un membre au projet</DialogTitle>
        <DialogContent>
                    <Autocomplete
            options={members}
            getOptionLabel={option =>
                `${option.firstName} ${option.lastName} (${option.email})`
            }
            value={selectedMember}
            onChange={(event, newValue) => {
                setSelectedMember(newValue);
            }}
            renderInput={(params) =>
                <TextField
                {...params}
                label="Sélectionner un membre"
                margin="dense"
                fullWidth
                helperText="Choisissez un membre à ajouter"
                />
            }
            />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Annuler</Button>
          <Button onClick={handleAddMember} variant="contained">Ajouter</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UserProjectsTable;