import * as React from 'react';
import { Project, IToDo, ProjectStatus, ToDoPriority } from '../class/Project';
import { ToDoCard } from './ToDoCard';
import { TodoForm } from './ToDoForm';
import { SearchBox } from './SearchBox'; // Import SearchBox

interface Props {
    project: Project;
    onUpdate: () => void;
}

export function ProjectTasksList({ project, onUpdate }: Props) {
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [todoToEdit, setTodoToEdit] = React.useState<IToDo | undefined>(undefined);
    const [searchQuery, setSearchQuery] = React.useState("");

    const filteredTodos = project.todos.filter(todo =>
        todo.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleAddTodo = () => {
        setTodoToEdit(undefined);
        setIsFormOpen(true);
    };

    const handleEditTodo = (todo: IToDo) => {
        setTodoToEdit(todo);
        setIsFormOpen(true);
    };

    const handleFormSubmit = (todoData: Partial<IToDo>) => {
        if (todoToEdit) {
            project.updateToDo(todoToEdit.id, todoData);
        } else {
            project.addToDo(
                todoData.title!,
                todoData.dueDate!,
                todoData.status,
                todoData.priority,
            );
        }
        onUpdate();
        setIsFormOpen(false);
        setTodoToEdit(undefined);
    };

    const handleFormClose = () => {
        setIsFormOpen(false);
        setTodoToEdit(undefined);
    };

    const handleStatusChange = (id: string, status: ProjectStatus) => {
        project.updateToDoStatus(id, status);
        onUpdate();
    };

    const handleToggleComplete = (id: string) => {
        project.toggleToDo(id);
        onUpdate();
    };

    const handlePriorityChange = (id: string, priority: ToDoPriority) => {
        project.updateToDoPriority(id, priority);
        onUpdate();
    };

    return (
        <>
            {isFormOpen && (
                <TodoForm
                    onSubmit={handleFormSubmit}
                    onClose={handleFormClose}
                    todoToEdit={todoToEdit}
                />
            )}

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 30px" }}>
                <h3>To-Do's</h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '15px' }}>
                    <SearchBox onChange={setSearchQuery} placeholder="Search To-Do's..." />
                    <span
                        className="material-symbols-rounded"
                        onClick={handleAddTodo}
                        style={{ cursor: 'pointer' }}
                    >
                        add
                    </span>
                </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', padding: '10px 30px' }}>
                {filteredTodos.map(todo => (
                    <ToDoCard
                        key={todo.id}
                        todo={todo}
                        onEdit={handleEditTodo}
                        onStatusChange={handleStatusChange}
                        onToggleComplete={handleToggleComplete}
                        onPriorityChange={handlePriorityChange}
                    />
                ))}
            </div>
        </>
    );
}