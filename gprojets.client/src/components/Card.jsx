// src/components/Card.jsx
import React from 'react';
import { Draggable } from "react-beautiful-dnd";
import { TimeOutline } from "react-ionicons";

const Card = ({ task, index }) => {
    const getPriorityColor = () => {
        switch (task.priority) {
            case "high": return "bg-red-500";
            case "medium": return "bg-yellow-500";
            default: return "bg-green-500";
        }
    };

    return (
        <Draggable draggableId={task.id.toString()} index={index}>
            {(provided) => (
                <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="w-full bg-white cursor-grab rounded-lg shadow-sm border border-gray-200 p-4 mb-4 transition-transform hover:shadow-md hover:scale-[1.01]"
                >
                    <div className="flex flex-wrap gap-2 mb-2">
                        {task.tags?.map((tag) => (
                            <span key={tag.title} className="text-xs font-medium rounded-full px-2 py-1" style={{ backgroundColor: tag.bg, color: tag.text }}>
                                {tag.title}
                            </span>
                        ))}
                    </div>
                    <div className="flex flex-col gap-1 mb-2">
                        <h3 className="text-base font-semibold text-gray-800">{task.title}</h3>
                        <p className="text-sm text-gray-600">{task.description}</p>
                    </div>
                    <div className="flex justify-between items-center text-sm text-gray-500">
                        <div className="flex items-center gap-1">
                            <TimeOutline color="#666" width="18px" height="18px" />
                            <span>{task.deadline}</span>
                        </div>
                        <div className={`h-2 w-[60px] rounded-full ${getPriorityColor()}`}></div>
                    </div>
                </div>
            )}
        </Draggable>
    );
};

export default Card;
