import React, { useState, useEffect } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import {
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Button,
  CircularProgress,
  Tooltip,
  Avatar,
  Stack,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";

function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return {
      userId: decoded.UserId || decoded.userId,
      role:
        decoded.role ||
        decoded["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"],
      email: decoded.email,
    };
  } catch {
    return null;
  }
}

const UserTasks = () => {
  const user = getUserFromToken();
  const userId = user?.userId;

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  // to store full user details for assignedTo in tasks
  const [assignedUsersMap, setAssignedUsersMap] = useState({});

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editAssignedToId, setEditAssignedToId] = useState("");

  const [projectMembers, setProjectMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  // Fetch the current user's assigned tasks
  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
  }, [userId]);

  // Fetch tasks assigned to the current user
  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await axios.get(
        `http://localhost:5035/api/Project/UserTasks/${userId}`
      );
      const fetchedTasks = res.data || [];
      setTasks(fetchedTasks);

      // Fetch detailed user info for assignedTo users in tasks to avoid showing just userId
      const assignedUserIds = [
        ...new Set(fetchedTasks.map((t) => t.assignedToId)),
      ].filter(Boolean);

      if (assignedUserIds.length > 0) {
        const usersDetails = await Promise.all(
          assignedUserIds.map((id) => fetchUserById(id))
        );
        // Map userId to user details
        const map = {};
        usersDetails.forEach((u) => {
          if (u) map[u.userId] = u;
        });
        setAssignedUsersMap(map);
      } else {
        setAssignedUsersMap({});
      }
    } catch (err) {
      console.error("Erreur lors du chargement des tâches", err);
      alert("Erreur lors du chargement des tâches.");
      setTasks([]);
    } finally {
      setLoadingTasks(false);
    }
  };

  // Fetch single user details by userId
  const fetchUserById = async (userId) => {
    try {
      const res = await axios.get(
        `http://localhost:5035/api/User/${userId}`
      );
      return res.data;
    } catch {
      return null;
    }
  };

  // Fetch members of a project for reassignment dropdown
  const fetchProjectMembers = async (projectId) => {
    try {
      setLoadingMembers(true);
      const res = await axios.get(
        `http://localhost:5035/api/Project/ProjectMembers/${projectId}`
      );
      setProjectMembers(res.data || []);
    } catch (err) {
      console.error("Erreur lors du chargement des membres", err);
      setProjectMembers([]);
      alert("Erreur lors du chargement des membres du projet.");
    } finally {
      setLoadingMembers(false);
    }
  };

  const handleEditClick = (task) => {
    setSelectedTask(task);
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditStatus(task.status);
    setEditAssignedToId(task.assignedToId);
    if (task.project?.projectId) {
      fetchProjectMembers(task.project.projectId);
    } else {
      setProjectMembers([]);
    }
    setOpenEdit(true);
  };

  const handleCloseEdit = () => {
    setOpenEdit(false);
    setSelectedTask(null);
    setProjectMembers([]);
  };

  const handleUpdateTask = async () => {
    if (!selectedTask) return;
    if (!editTitle.trim()) {
      alert("Le titre est requis.");
      return;
    }
    try {
      await axios.put(
        `http://localhost:5035/api/Project/UpdateTask/${selectedTask.tacheId}`,
        {
          title: editTitle,
          description: editDescription,
          status: editStatus,
          assignedToId: editAssignedToId,
        }
      );
      alert("Tâche mise à jour avec succès.");
      // Refresh tasks and assigned users data
      fetchTasks();
      handleCloseEdit();
    } catch (err) {
      console.error("Erreur lors de la mise à jour de la tâche", err);
      alert("Erreur lors de la mise à jour de la tâche.");
    }
  };

  if (!userId) {
    return (
      <Typography variant="h6" sx={{ m: 3 }}>
        Veuillez vous connecter pour voir vos tâches.
      </Typography>
    );
  }

  return (
    <Paper sx={{ padding: 3 }}>
      <Typography variant="h5" gutterBottom>
        Mes Tâches Assignées
      </Typography>

      {loadingTasks ? (
        <div style={{ display: "flex", justifyContent: "center", padding: 20 }}>
          <CircularProgress />
        </div>
      ) : tasks.length === 0 ? (
        <Typography>Aucune tâche assignée pour le moment.</Typography>
      ) : (
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Titre</TableCell>
                <TableCell>Description</TableCell>
                <TableCell>Statut</TableCell>
                <TableCell>Projet</TableCell>
                <TableCell>Assigné à</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {tasks.map((task) => {
                const assignedUser = assignedUsersMap[task.assignedToId];
                return (
                  <TableRow key={task.tacheId} hover>
                    <TableCell>{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>{task.status}</TableCell>
                    <TableCell>{task.project?.title || "-"}</TableCell>
                    <TableCell>
                      {assignedUser ? (
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Avatar sx={{ width: 24, height: 24, fontSize: 12 }}>
                            {assignedUser.firstName[0]}
                          </Avatar>
                          <Typography variant="body2">
                            {assignedUser.firstName} {assignedUser.lastName} (
                            {assignedUser.email})
                          </Typography>
                        </Stack>
                      ) : (
                        task.assignedToId
                      )}
                    </TableCell>
                    <TableCell>
                      <Tooltip title="Modifier la tâche">
                        <IconButton
                          onClick={() => handleEditClick(task)}
                          color="primary"
                        >
                          <EditIcon />
                        </IconButton>
                      </Tooltip>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Edit Task Dialog */}
      <Dialog open={openEdit} onClose={handleCloseEdit} maxWidth="sm" fullWidth>
        <DialogTitle>Modifier la Tâche</DialogTitle>
        <DialogContent>
          <TextField
            label="Titre"
            fullWidth
            margin="normal"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
          />
          <TextField
            label="Description"
            fullWidth
            multiline
            margin="normal"
            minRows={3}
            value={editDescription}
            onChange={(e) => setEditDescription(e.target.value)}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel id="status-label">Statut</InputLabel>
            <Select
              labelId="status-label"
              value={editStatus}
              label="Statut"
              onChange={(e) => setEditStatus(e.target.value)}
            >
              <MenuItem value="En attente">En attente</MenuItem>
              <MenuItem value="En cours">En cours</MenuItem>
              <MenuItem value="Terminé">Terminé</MenuItem>
            </Select>
          </FormControl>

          <FormControl fullWidth margin="normal" disabled={loadingMembers}>
            <InputLabel id="assign-label">Réassigner à</InputLabel>
            <Select
              labelId="assign-label"
              value={editAssignedToId}
              label="Réassigner à"
              onChange={(e) => setEditAssignedToId(e.target.value)}
            >
              {loadingMembers ? (
                <MenuItem disabled>Chargement...</MenuItem>
              ) : projectMembers.length === 0 ? (
                <MenuItem disabled>Aucun membre disponible</MenuItem>
              ) : (
                projectMembers.map((member) => (
                  <MenuItem key={member.userId} value={member.userId}>
                    {member.firstName} {member.lastName} ({member.email})
                  </MenuItem>
                ))
              )}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseEdit}>Annuler</Button>
          <Button variant="contained" color="primary" onClick={handleUpdateTask}>
            Mettre à jour
          </Button>
        </DialogActions>
      </Dialog>
    </Paper>
  );
};

export default UserTasks;