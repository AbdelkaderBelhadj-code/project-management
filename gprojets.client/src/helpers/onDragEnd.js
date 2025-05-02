export const onDragEnd = (result, columns, setColumns) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceCol = columns[source.droppableId];
    const destCol = columns[destination.droppableId];

    const sourceItems = [...sourceCol.items];
    const destItems = [...destCol.items];

    const [movedTask] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, movedTask);

    const newState = {
        ...columns,
        [source.droppableId]: { ...sourceCol, items: sourceItems },
        [destination.droppableId]: { ...destCol, items: destItems },
    };

    setColumns(newState);
};
