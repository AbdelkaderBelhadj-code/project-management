// GanttChart.js
import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Tooltip from '@mui/material/Tooltip';
import dayjs from 'dayjs';

const statusColors = {
    "En cours": "#1976d2",
    "En attente": "#fbc02d",
    "Terminée": "#388e3c",
};
const statusNames = Object.keys(statusColors);

export default function GanttChart({ taches, dateDebut, dateFin }) {
    if (!taches || taches.length === 0) return (
        <Typography color="text.secondary">Aucune tâche pour ce projet.</Typography>
    );
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
            minWidth: 48, // Increased spacing
            maxWidth: 64,
            textAlign: 'center',
            fontSize: 13,
            color: "#5f6368",
            borderLeft: i !== 0 ? '1px solid #dce3ea' : 'none',
            px: 0.5,
            py: 0.8,
            backgroundColor: i % 2 ? '#f8fbfd' : '#edf3f8',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
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
}