// src/components/Column.jsx
import React from 'react';
import styled from "styled-components";
import { Droppable } from "react-beautiful-dnd";
import Card from "./Card";
import "./scroll.css";

const Container = styled.div`
  background-color: #ffffff;
  border-radius: 12px;
  width: 320px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 4px 12px rgba(0,0,0,0.05);
  border: 1px solid #e0e0e0;
  display: flex;
  flex-direction: column;
  margin: 0 8px;
`;

const Title = styled.h3`
  padding: 16px;
  font-size: 18px;
  font-weight: bold;
  background-color: #e3f2fd;
  color: #0d47a1;
  text-align: center;
  border-bottom: 1px solid #ccc;
  border-radius: 12px 12px 0 0;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TaskList = styled.div`
  padding: 16px;
  flex-grow: 1;
  background-color: ${props => (props.isDraggingOver ? '#e0f7fa' : 'transparent')};
  transition: background-color 0.3s ease;
  min-height: 120px;
`;

export default function Column({ id, title, tasks }) {
    return (
        <Container className="column">
            <Title>{title}</Title>
            <Droppable droppableId={id}>
                {(provided, snapshot) => (
                    <TaskList
                        ref={provided.innerRef}
                        {...provided.droppableProps}
                        isDraggingOver={snapshot.isDraggingOver}
                    >
                        {tasks.map((task, index) => (
                            <Card key={task.id} index={index} task={task} />
                        ))}
                        {provided.placeholder}
                    </TaskList>
                )}
            </Droppable>
        </Container>
    );
}
