import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import { jwtDecode } from "jwt-decode";
import dayjs from "dayjs";
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
  Box,
} from "@mui/material";
import { Edit as EditIcon } from "@mui/icons-material";

// Gantt chart colors for status
const STATUS_COLORS = {
  "En attente": "#fbc02d",
  "En cours": "#1976d2",
  "Terminée": "#388e3c",
};

const DAY_WIDTH = 32;

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
      firstName: decoded.firstName,
      lastName: decoded.lastName,
    };
  } catch {
    return null;
  }
}

const GanttChart = ({ member, tasks }) => {
  const allTasks = tasks || [];
  if (allTasks.length === 0) {
    return (
      <Typography color="text.secondary" sx={{ mt: 2 }}>
        Aucun plan de tâches à afficher.
      </Typography>
    );
  }

  const minDate = dayjs(Math.min(...allTasks.map(t => dayjs(t.dateDebut).valueOf())));
  const maxDate = dayjs(Math.max(...allTasks.map(t => dayjs(t.dateFin).valueOf())));

  const days = [];
  let d = minDate.startOf("day");
  while (d.isBefore(maxDate) || d.isSame(maxDate, "day")) {
    days.push(d);
    d = d.add(1, "day");
    if (days.length > 90) break;
  }

  const rowHeight = 38;
  const barHeight = 18;
  const labelColWidth = 160; // px
  const chartWidth = Math.max(days.length * DAY_WIDTH, 400);

  return (
    <Box
      sx={{
        overflowX: "auto",
        border: "1px solid #eee",
        borderRadius: 2,
        bgcolor: "#f7fafc",
        p: 2,
        boxShadow: 1,
        my: 4,
      }}
    >
      <Typography sx={{ fontWeight: 600, mb: 1, color: "primary.main" }}>
        Diagramme de Gantt de mes tâches
      </Typography>

      {/* Status legend */}
      <Box sx={{ display: "flex", gap: 2, mb: 1 }}>
        {Object.entries(STATUS_COLORS).map(([s, c]) => (
          <Box key={s} sx={{ display: "flex", alignItems: "center", mr: 2 }}>
            <Box sx={{
              width: 18, height: 12, borderRadius: 1, background: c, mr: 1, boxShadow: 1,
            }} />
            <Typography variant="caption" color="text.secondary">{s}</Typography>
          </Box>
        ))}
      </Box>

      {/* Header - dates */}
      <Box
        sx={{
          display: "flex",
          fontSize: 12,
          fontWeight: 600,
          color: "#333",
          ml: `${labelColWidth}px`,
          position: "sticky",
          top: 0,
          zIndex: 10,
          backgroundColor: "#fbfcfd",
          borderBottom: "1px solid #ddd",
        }}
      >
        {days.map((d, idx) => (
          <Box
            key={idx}
            sx={{
              width: DAY_WIDTH,
              flexShrink: 0,
              textAlign: "center",
              py: "4px",
              borderRight: idx !== days.length - 1 ? "1px solid #eaeaea" : "none",
            }}
          >
            {d.format("DD/MM")}
          </Box>
        ))}
      </Box>

      {/* Row: only the current user */}
      <Box>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            height: rowHeight,
            bgcolor: "#fff",
            position: "relative",
            ":hover": { bgcolor: "#f1f7fd" },
            transition: "background 0.2s",
            borderTop: "1px solid #eee",
          }}
        >
          {/* Member name */}
          <Box
            sx={{
              width: labelColWidth,
              flexShrink: 0,
              fontWeight: 500,
              pl: 1,
              color: "#333",
              fontSize: 15,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis"
            }}
            title={`${member.firstName} ${member.lastName}`}
          >
            {member.firstName} {member.lastName}
          </Box>
          {/* Gantt bars */}
          <Box
            sx={{
              position: "relative",
              width: chartWidth,
              height: rowHeight,
              display: "flex",
              alignItems: "center"
            }}
          >
            {allTasks.map((t, i) => {
              const start = dayjs(t.dateDebut);
              const end = dayjs(t.dateFin);
              const leftDays = start.diff(minDate, "day");
              const barDays = Math.max(end.diff(start, "day") + 1, 1);
              const leftPx = leftDays * DAY_WIDTH;
              const widthPx = barDays * DAY_WIDTH;

              return (
                <Tooltip
                  key={t.tacheId}
                  title={
                    <Box sx={{ p: 0.5 }}>
                      <b>{t.title}</b>
                      <br />
                      {t.description}
                      <br />
                      <span>
                        <i>
                          {start.format("DD/MM/YYYY")} → {end.format("DD/MM/YYYY")}
                        </i>
                      </span>
                      <br />
                      <span
                        style={{
                          fontWeight: 500,
                          color: STATUS_COLORS[t.status] || "#888"
                        }}
                      >
                        {t.status}
                      </span>
                    </Box>
                  }
                  arrow
                >
                  <Box
                    sx={{
                      position: "absolute",
                      top: (rowHeight - barHeight) / 2,
                      left: leftPx,
                      width: widthPx,
                      height: barHeight,
                      bgcolor: STATUS_COLORS[t.status] || "#bdbdbd",
                      borderRadius: "9px",
                      boxShadow: "0 2px 7px 0 #0001",
                      color: "#fff",
                      fontWeight: 500,
                      fontSize: 13,
                      px: 1,
                      display: "flex",
                      alignItems: "center",
                      overflow: "hidden",
                      cursor: "pointer",
                      border: "2px solid #fff",
                      transition: "background 0.2s"
                    }}
                  >
                    <span
                      style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        width: "100%",
                      }}
                    >
                      {t.title}
                    </span>
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

const UserTasks = () => {
  const user = getUserFromToken();
  const userId = user?.userId;

  const [tasks, setTasks] = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);

  const [assignedUsersMap, setAssignedUsersMap] = useState({});

  const [openEdit, setOpenEdit] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [editStatus, setEditStatus] = useState("");
  const [editAssignedToId, setEditAssignedToId] = useState("");

  const [projectMembers, setProjectMembers] = useState([]);
  const [loadingMembers, setLoadingMembers] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchTasks();
    }
    // eslint-disable-next-line
  }, [userId]);

  const fetchTasks = async () => {
    try {
      setLoadingTasks(true);
      const res = await axios.get(
        `http://localhost:5035/api/Project/UserTasks/${userId}`
      );
      const fetchedTasks = res.data || [];
      setTasks(fetchedTasks);

      // Fetch detailed user info for assignedTo users in tasks
      const assignedUserIds = [
        ...new Set(fetchedTasks.map((t) => t.assignedToId)),
      ].filter(Boolean);

      if (assignedUserIds.length > 0) {
        const usersDetails = await Promise.all(
          assignedUserIds.map((id) => fetchUserById(id))
        );
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

  // Compose member object for chart
  const chartMember = {
    ...user,
    firstName: user.firstName || "Utilisateur",
    lastName: user.lastName || "",
  };

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
        <>
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
                              {assignedUser.firstName
                                ? assignedUser.firstName[0]
                                : "?"}
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

          {/* Gantt Chart Visualization */}
          <GanttChart member={chartMember} tasks={tasks} />
        </>
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
              <MenuItem value="Terminée">Terminée</MenuItem>
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