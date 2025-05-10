import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import {
  Box, Typography, Paper, Table, TableHead, TableRow, TableCell, TableBody, Button,
  Dialog, DialogTitle, DialogContent, DialogActions, TextField, IconButton,
  MenuItem, Select, FormControl, InputLabel, CircularProgress, Tooltip
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddTaskIcon from "@mui/icons-material/AddTask";
import EditIcon from "@mui/icons-material/Edit";
import AddIcon from "@mui/icons-material/Add";
import { jwtDecode } from "jwt-decode";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";

const DAY_WIDTH = 36;
const STATUS_COLORS = {
  "En attente": "#ffd700", // yellow
  "En cours": "#1976d2",   // blue
  "Terminée": "#43a047",   // green
};

// GanttChart component
const GanttChart = ({ members, tasksByUser }) => {
  const allTasks = useMemo(
    () => members.flatMap(m => tasksByUser[m.userId] || []),
    [members, tasksByUser]
  );
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
  const chartWidth = Math.max(days.length * 32, 400);

  return (
    <Box
      sx={{
        overflowX: "auto",
        border: "1px solid #eee",
        borderRadius: 2,
        bgcolor: "#f7fafc",
        p: 2,
        boxShadow: 1,
      }}
    >
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

      {/* Rows */}
      <Box>
        {members.map((m, rowIdx) => (
          <Box
            key={m.userId}
            sx={{
              display: "flex",
              alignItems: "center",
              borderTop: rowIdx !== 0 ? "1px solid #eee" : "none",
              height: rowHeight,
              bgcolor: rowIdx % 2 === 0 ? "#fff" : "#f5f7fa",
              position: "relative",
              ":hover": { bgcolor: "#f1f7fd" },
              transition: "background 0.2s"
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
              title={`${m.firstName} ${m.lastName}`}
            >
              {m.firstName} {m.lastName}
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
              {(tasksByUser[m.userId] || []).map((t, i) => {
                const start = dayjs(t.dateDebut);
                const end = dayjs(t.dateFin);
                const leftDays = start.diff(minDate, "day");
                const barDays = Math.max(end.diff(start, "day") + 1, 1);
                const leftPx = leftDays * 32;
                const widthPx = barDays * 32;

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
        ))}
      </Box>
    </Box>
  );
};

function getUserFromToken() {
  const token = localStorage.getItem("token");
  if (!token) return null;
  try {
    const decoded = jwtDecode(token);
    return {
      userId: decoded.UserId || decoded.userId,
      role: decoded.Role || decoded.role,
      email: decoded.Email || decoded.email,
    };
  } catch {
    return null;
  }
}

function normalizeProject(obj, cache = {}) {
  if (!obj) return obj;
  if (typeof obj !== "object") return obj;
  if (obj.$ref) return cache[obj.$ref];
  if (obj.$id) cache[obj.$id] = obj;
  if (obj.$values) return obj.$values.map(o => normalizeProject(o, cache));
  for (const key of Object.keys(obj)) {
    obj[key] = normalizeProject(obj[key], cache);
  }
  return obj;
}

const defaultTask = {
  title: "",
  description: "",
  status: "En attente",
  dateDebut: null,
  dateFin: null,
};

const API_URL = "http://localhost:5035/api";

const ProjectMembersTasksManager = () => {
  const user = getUserFromToken();

  // PROJECTS
  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  // MEMBERS & TASKS
  const [members, setMembers] = useState([]);
  const [allMembers, setAllMembers] = useState([]);
  const [tasksByUser, setTasksByUser] = useState({});

  // LOADING
  const [loading, setLoading] = useState(false);

  // TASK DIALOG
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [taskForm, setTaskForm] = useState(defaultTask);
  const [editingTaskId, setEditingTaskId] = useState(null);

  // ADD-MEMBER DIALOG
  const [memberDialogOpen, setMemberDialogOpen] = useState(false);
  const [membersToAddIds, setMembersToAddIds] = useState([]);

  // Fetch all projects (where current user is chef)
  useEffect(() => {
    async function fetchProjects() {
      if (!user?.userId) return;
      setLoading(true);
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/Project/All`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const allProjects = normalizeProject(res.data);
        const myChefProjects = allProjects.filter(
          p => String(p.chefId) === String(user.userId)
        );
        setProjects(myChefProjects);
      } catch {
        setProjects([]);
      }
      setLoading(false);
    }
    fetchProjects();
  }, [user?.userId]);

  // Fetch all existing members once
  useEffect(() => {
    async function fetchAllMembers() {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`${API_URL}/User/Members`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const normalized = normalizeProject(res.data);
        setAllMembers(Array.isArray(normalized) ? normalized : []);
      } catch {
        setAllMembers([]);
      }
    }
    fetchAllMembers();
  }, []);

  // Whenever selectedProjectId changes, load its members + tasks
  useEffect(() => {
    if (!selectedProjectId) {
      setMembers([]);
      setTasksByUser({});
      return;
    }
    setLoading(true);
    const proj = projects.find(
      p => String(p.projectId) === String(selectedProjectId)
    );
    const projMembers = (proj?.userProjects || []).map(up => up.user);
    setMembers(projMembers);

    const grouped = {};
    (proj?.taches || []).forEach(t => {
      grouped[t.assignedToId] = grouped[t.assignedToId] || [];
      grouped[t.assignedToId].push(t);
    });
    setTasksByUser(grouped);

    setLoading(false);
  }, [selectedProjectId, projects]);

  // ---- TASK DIALOG HELPERS ----
  const openAssignDialog = (member, task = null) => {
    setSelectedMember(member);
    if (task) {
      setTaskForm({
        title: task.title,
        description: task.description,
        status: task.status || "En attente",
        dateDebut: task.dateDebut ? dayjs(task.dateDebut) : null,
        dateFin: task.dateFin ? dayjs(task.dateFin) : null,
      });
      setEditingTaskId(task.tacheId);
    } else {
      setTaskForm(defaultTask);
      setEditingTaskId(null);
    }
    setTaskDialogOpen(true);
  };
  const closeAssignDialog = () => {
    setTaskDialogOpen(false);
    setSelectedMember(null);
    setTaskForm(defaultTask);
    setEditingTaskId(null);
  };

  const handleSaveTask = async () => {
    if (
      !taskForm.title ||
      !taskForm.description ||
      !taskForm.dateDebut ||
      !taskForm.dateFin
    ) {
      alert("Tous les champs sont requis, y compris les dates.");
      return;
    }
    if (dayjs(taskForm.dateDebut).isAfter(dayjs(taskForm.dateFin))) {
      alert("La date de début doit être avant la date de fin.");
      return;
    }
    setLoading(true);
    const token = localStorage.getItem("token");
    try {
      if (editingTaskId) {
        // UPDATE
        await axios.put(
          `${API_URL}/Project/UpdateTask/${editingTaskId}`,
          {
            ...taskForm,
            assignedToId: selectedMember.userId,
            dateDebut: dayjs(taskForm.dateDebut).toISOString(),
            dateFin: dayjs(taskForm.dateFin).toISOString(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setTasksByUser(prev => {
          const next = {};
          Object.keys(prev).forEach(uid => {
            next[uid] = prev[uid].filter(t => t.tacheId !== editingTaskId);
          });
          next[selectedMember.userId] = [
            ...(next[selectedMember.userId] || []),
            { ...taskForm, tacheId: editingTaskId, assignedToId: selectedMember.userId }
          ];
          return next;
        });
      } else {
        // ADD
        const res = await axios.post(
          `${API_URL}/Project/${selectedProjectId}/AddTask`,
          {
            ...taskForm,
            assignedToId: selectedMember.userId,
            dateDebut: dayjs(taskForm.dateDebut).toISOString(),
            dateFin: dayjs(taskForm.dateFin).toISOString(),
          },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const newTask = res.data.tache;
        setTasksByUser(prev => ({
          ...prev,
          [selectedMember.userId]: [...(prev[selectedMember.userId] || []), newTask]
        }));
      }
      closeAssignDialog();
    } catch (e) {
      alert(e.response?.data?.message || "Erreur lors de l'opération sur la tâche.");
    }
    setLoading(false);
  };

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("Supprimer cette tâche ?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/Project/DeleteTask/${taskId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTasksByUser(prev => {
        const next = {};
        Object.keys(prev).forEach(uid => {
          next[uid] = prev[uid].filter(t => t.tacheId !== taskId);
        });
        return next;
      });
    } catch (e) {
      alert(e.response?.data?.message || "Erreur lors de la suppression de la tâche.");
    }
    setLoading(false);
  };

  // ---- ADD-MEMBER DIALOG HELPERS ----
  const openMemberDialog = () => {
    setMembersToAddIds([]);
    setMemberDialogOpen(true);
  };
  const closeMemberDialog = () => {
    setMemberDialogOpen(false);
    setMembersToAddIds([]);
  };
  const handleAddMember = async () => {
    if (!Array.isArray(membersToAddIds) || membersToAddIds.length === 0) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const addedMembers = [];
      for (const userId of membersToAddIds) {
        await axios.post(
          `${API_URL}/Project/${selectedProjectId}/AddMember/${userId}`,
          null,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        const added = allMembers.find(u => String(u.userId) === String(userId));
        if (added) addedMembers.push(added);
      }
      setMembers(prev => [...prev, ...addedMembers]);
      closeMemberDialog();
    } catch (e) {
      alert(e.response?.data?.message || "Erreur lors de l'ajout des membres.");
    }
    setLoading(false);
  };

  // ---- REMOVE MEMBER ----
  const handleRemoveMember = async (userId) => {
    if (!window.confirm("Retirer ce membre du projet ?")) return;
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`${API_URL}/Project/${selectedProjectId}/RemoveMember/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setMembers(prev => prev.filter(m => String(m.userId) !== String(userId)));
      setTasksByUser(prev => {
        const next = { ...prev };
        delete next[userId];
        return next;
      });
    } catch (e) {
      alert(e.response?.data?.message || "Erreur lors de la suppression du membre.");
    }
    setLoading(false);
  };

  const unassignedMembers = allMembers.filter(
    u => !members.some(m => String(m.userId) === String(u.userId))
  );

  // Helper to show date in French format
  const formatDate = date => date ? dayjs(date).format("DD/MM/YYYY") : "";

  // --- Get the selected project object ---
  const selectedProject = projects.find(
    p => String(p.projectId) === String(selectedProjectId)
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 1200, margin: "auto", mt: 5 }}>
        <Typography variant="h4" gutterBottom>
          Gestion des Membres et Tâches
        </Typography>

        <Paper sx={{ p: 2, mb: 3 }}>
          <FormControl fullWidth>
            <InputLabel id="project-select-label">Projet</InputLabel>
            <Select
              labelId="project-select-label"
              value={selectedProjectId}
              label="Projet"
              onChange={e => setSelectedProjectId(e.target.value)}
            >
              <MenuItem value="">
                <em>Sélectionner un projet</em>
              </MenuItem>
              {projects.map(p => (
                <MenuItem key={p.projectId} value={p.projectId}>
                  {p.title}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Paper>

        {/* --- Selected project details --- */}
        {!loading && selectedProject && (
          <Paper sx={{ p: 2, mb: 3, bgcolor: "#f5f7fa" }}>
            <Typography variant="h6" color="primary" gutterBottom>
              Détails du projet:
            </Typography>
            <Typography>
              <strong>Description:</strong>{" "}
              {selectedProject.description || <em>Aucune description</em>}
            </Typography>
            <Typography>
              <strong>Date début:</strong>{" "}
              {formatDate(selectedProject.dateDebut)}
            </Typography>
            <Typography>
              <strong>Date fin:</strong>{" "}
              {formatDate(selectedProject.dateFin)}
            </Typography>
          </Paper>
        )}

        {loading && <CircularProgress sx={{ display: "block", mx: "auto" }} />}

        {!loading && selectedProjectId && (
          <>
            <Paper elevation={3} sx={{ p: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Membre</TableCell>
                    <TableCell>Email</TableCell>
                    <TableCell>Tâches</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {members.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} align="center">
                        <IconButton
                          color="primary"
                          onClick={openMemberDialog}
                          title="Ajouter des membres"
                        >
                          <AddIcon fontSize="large" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  )}
                  {members.map(m => (
                    <TableRow key={m.userId}>
                      <TableCell>{m.firstName} {m.lastName}</TableCell>
                      <TableCell>{m.email}</TableCell>
                      <TableCell>
                        <ul style={{ margin: 0, paddingLeft: 18 }}>
                          {(tasksByUser[m.userId] || []).map(t => (
                            <li
                              key={t.tacheId}
                              style={{ display: "flex", alignItems: "center", flexWrap: "wrap" }}
                            >
                              <span>
                                <b>{t.title}</b> — {t.description}{" "}
                                <i>({t.status})</i>
                                <br />
                                <span style={{ fontSize: "0.9em", color: "#666" }}>
                                  Début: {formatDate(t.dateDebut)} &nbsp;|&nbsp;
                                  Fin: {formatDate(t.dateFin)}
                                </span>
                              </span>
                              <IconButton
                                size="small"
                                color="primary"
                                title="Modifier"
                                sx={{ ml: 1 }}
                                onClick={() => openAssignDialog(m, t)}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                              <IconButton
                                size="small"
                                color="error"
                                title="Supprimer"
                                sx={{ ml: 1 }}
                                onClick={() => handleDeleteTask(t.tacheId)}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </li>
                          ))}
                          {(tasksByUser[m.userId] || []).length === 0 && (
                            <Typography variant="caption" color="text.secondary">
                              Aucune tâche
                            </Typography>
                          )}
                        </ul>
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: "flex", flexDirection: "column", gap: 1 }}>
                          <Button
                            variant="outlined"
                            size="small"
                            startIcon={<AddTaskIcon />}
                            onClick={() => openAssignDialog(m)}
                          >
                            Assigner tâche
                          </Button>
                          <Button
                            variant="outlined"
                            color="error"
                            size="small"
                            startIcon={<DeleteIcon />}
                            onClick={() => handleRemoveMember(m.userId)}
                          >
                            Retirer membre
                          </Button>
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              {members.length > 0 && (
                <Box sx={{ mt: 2, textAlign: "right" }}>
                  <Button
                    variant="outlined"
                    startIcon={<AddIcon />}
                    onClick={openMemberDialog}
                  >
                    Ajouter des membres
                  </Button>
                </Box>
              )}
            </Paper>

            {/* Gantt Chart */}
            {members.length > 0 && (
              <Box sx={{ mt: 4, mb: 2 }}>
                <Typography variant="h6" gutterBottom>
                  Diagramme de Gantt
                </Typography>
                <GanttChart
                  members={members}
                  tasksByUser={tasksByUser}
                />
              </Box>
            )}
          </>
        )}

        {/* Task assign/edit dialog */}
        <Dialog
          open={taskDialogOpen}
          onClose={closeAssignDialog}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle>
            {editingTaskId
              ? `Modifier la tâche de ${selectedMember?.firstName} ${selectedMember?.lastName}`
              : `Assigner une tâche à ${selectedMember?.firstName} ${selectedMember?.lastName}`}
          </DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              margin="dense"
              label="Titre"
              fullWidth
              value={taskForm.title}
              onChange={e => setTaskForm({ ...taskForm, title: e.target.value })}
              required
            />
            <TextField
              margin="dense"
              label="Description"
              fullWidth
              multiline
              minRows={2}
              value={taskForm.description}
              onChange={e => setTaskForm({ ...taskForm, description: e.target.value })}
              required
            />
            <FormControl fullWidth margin="normal">
              <InputLabel id="status-label">Statut</InputLabel>
              <Select
                labelId="status-label"
                value={taskForm.status}
                label="Statut"
                onChange={e => setTaskForm({ ...taskForm, status: e.target.value })}
              >
                <MenuItem value="En attente">En attente</MenuItem>
                <MenuItem value="En cours">En cours</MenuItem>
                <MenuItem value="Terminée">Terminée</MenuItem>
              </Select>
            </FormControl>
            <Box sx={{ display: "flex", gap: 2, mt: 1 }}>
              <DatePicker
                label="Date de début"
                value={taskForm.dateDebut}
                onChange={date => setTaskForm({ ...taskForm, dateDebut: date })}
                slotProps={{ textField: { fullWidth: true } }}
                format="DD/MM/YYYY"
              />
              <DatePicker
                label="Date de fin"
                value={taskForm.dateFin}
                onChange={date => setTaskForm({ ...taskForm, dateFin: date })}
                slotProps={{ textField: { fullWidth: true } }}
                format="DD/MM/YYYY"
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeAssignDialog}>Annuler</Button>
            <Button
              disabled={
                !taskForm.title ||
                !taskForm.description ||
                !taskForm.dateDebut ||
                !taskForm.dateFin
              }
              onClick={handleSaveTask}
              variant="contained"
            >
              {editingTaskId ? "Mettre à jour" : "Assigner"}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Add-members dialog */}
        <Dialog
          open={memberDialogOpen}
          onClose={closeMemberDialog}
          maxWidth="xs"
          fullWidth
        >
          <DialogTitle>Ajouter des membres existants</DialogTitle>
          <DialogContent>
            <FormControl fullWidth margin="dense">
              <InputLabel id="add-member-label">Membres</InputLabel>
              <Select
                labelId="add-member-label"
                multiple
                value={membersToAddIds}
                label="Membres"
                onChange={e => setMembersToAddIds(e.target.value)}
                renderValue={selected =>
                  Array.isArray(selected)
                    ? selected.map(id => {
                        const u = allMembers.find(m => String(m.userId) === String(id));
                        return u ? `${u.firstName} ${u.lastName}` : id;
                      }).join(', ')
                    : ''
                }
              >
                {unassignedMembers.map(u => (
                  <MenuItem key={u.userId} value={u.userId}>
                    {u.firstName} {u.lastName} — {u.email}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeMemberDialog}>Annuler</Button>
            <Button
              disabled={!membersToAddIds || membersToAddIds.length === 0}
              onClick={handleAddMember}
              variant="contained"
            >
              Ajouter
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </LocalizationProvider>
  );
};

export default ProjectMembersTasksManager;