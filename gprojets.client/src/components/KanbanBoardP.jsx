import React, { useState } from "react";
import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
import Board from "./Board";
import Task from "./Task";
import AddModal from "./AddModal";
import { AddOutline } from "react-ionicons";
import onDragEnd from "../helpers/onDragEnd"; // assure-toi d'avoir cette fonction

const KanbanBoardP = () => {
    const [columns, setColumns] = useState(Board);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedColumn, setSelectedColumn] = useState("");

    const openModal = (columnId) => {
        setSelectedColumn(columnId);
        setModalOpen(true);
    };

    const closeModal = () => {
        setModalOpen(false);
    };

    const handleAddTask = (taskData) => {
        const newBoard = { ...columns };
        newBoard[selectedColumn].items.push(taskData);
        setColumns(newBoard); // n'oublie pas de mettre à jour le state
        closeModal();
    };

    return (
        <>
            <DragDropContext onDragEnd={(result) => onDragEnd(result, columns, setColumns)}>
                <div className="w-full flex flex-wrap gap-4 justify-start px-5 pb-8">
                    {Object.entries(columns).map(([columnId, column]) => (
                        <div className="flex flex-col items-center" key={columnId}>
                            <Droppable droppableId={columnId}>
                                {(provided) => (
                                    <div
                                        ref={provided.innerRef}
                                        {...provided.droppableProps}
                                        className="bg-white rounded-lg shadow-md p-4 w-[270px] min-h-[100px]"
                                    >
                                        <h2 className="text-lg font-semibold text-gray-700 text-center mb-2">{column.name}</h2>
                                        {column.items.map((task, index) => (
                                            <Draggable key={task.id} draggableId={task.id} index={index}>
                                                {(provided) => (
                                                    <div
                                                        ref={provided.innerRef}
                                                        {...provided.draggableProps}
                                                        {...provided.dragHandleProps}
                                                        className="mb-3"
                                                    >
                                                        <Task task={task} />
                                                    </div>
                                                )}
                                            </Draggable>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                            <div
                                onClick={() => openModal(columnId)}
                                className="mt-2 cursor-pointer text-sm text-gray-600 bg-white px-3 py-2 rounded-md shadow flex items-center gap-1"
                            >
                                <AddOutline color={"#555"} />
                                Add Task
                            </div>
                        </div>
                    ))}
                </div>
            </DragDropContext>

            <AddModal
                isOpen={modalOpen}
                onClose={closeModal}
                setOpen={setModalOpen}
                handleAddTask={handleAddTask}
            />
        </>
    );
};

export default KanbanBoardP;
