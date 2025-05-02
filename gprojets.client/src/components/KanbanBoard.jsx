// src/components/KanbanBoard.jsx
import React, { useState, useEffect } from 'react';
import { DragDropContext } from "react-beautiful-dnd";
import Column from "./Column";

export default function KanbanBoard() {
    const [completed, setCompleted] = useState([]);
    const [incomplete, setIncomplete] = useState([]);
    const [inReview, setInReview] = useState([]);

    useEffect(() => {
        fetch("https://jsonplaceholder.typicode.com/todos")
            .then((res) => res.json())
            .then((json) => {
                const testTasks = json.slice(0, 15).map((t, index) => ({
                    ...t,
                    id: t.id.toString(), // DnD needs id as string
                    title: t.title,
                    description: "Tâche exemple",
                    priority: ["low", "medium", "high"][index % 3],
                    deadline: Math.floor(Math.random() * 60),
                    tags: [{ title: "API", bg: "#dfe6e9", text: "#2d3436" }]
                }));

                setIncomplete(testTasks.slice(0, 5));
                setCompleted(testTasks.slice(5, 10));
                setInReview(testTasks.slice(10, 15));
            });
    }, []);

    const handleDragEnd = ({ source, destination, draggableId }) => {
        if (!destination || source.droppableId === destination.droppableId) return;

        const allTasks = [...completed, ...incomplete, ...inReview];
        const task = allTasks.find(t => t.id === draggableId);
        if (!task) return;

        removeFromState(source.droppableId, task.id);
        addToState(destination.droppableId, task);
    };

    const removeFromState = (droppableId, id) => {
        switch (droppableId) {
            case "1": setIncomplete(prev => prev.filter(t => t.id !== id)); break;
            case "2": setCompleted(prev => prev.filter(t => t.id !== id)); break;
            case "3": setInReview(prev => prev.filter(t => t.id !== id)); break;
            default: break;
        }
    };

    const addToState = (droppableId, task) => {
        const updated = { ...task, completed: droppableId === "2" };
        switch (droppableId) {
            case "1": setIncomplete(prev => [updated, ...prev]); break;
            case "2": setCompleted(prev => [updated, ...prev]); break;
            case "3": setInReview(prev => [updated, ...prev]); break;
            default: break;
        }
    };

    return (
        <div style={{ width: "100%", maxWidth: "1400px" }}>
            <h2 style={{ textAlign: "center", marginBottom: "1rem" }}>Tableau de Progrès</h2>
            <DragDropContext onDragEnd={handleDragEnd}>
                <div style={{
                    display: "flex",
                    gap: "1rem",
                    paddingBottom: "1rem"
                }}>
                    <Column title="TO DO" tasks={incomplete} id="1" />
                    <Column title="DONE" tasks={completed} id="2" />
                    <Column title="IN REVIEW" tasks={inReview} id="3" />
                </div>
            </DragDropContext>
        </div>
    );
}