import * as React from 'react';
import { Project, IToDo, ProjectStatus } from '../class/Project';
import { ToDoCard } from './ToDoCard';
import { TodoForm } from './ToDoForm';
import { SearchBox } from './SearchBox';

interface Props {
    project: Project;
    onUpdate: () => void;
}

export function ProjectTasksList({ project, onUpdate }: Props) {
    const [isFormOpen, setIsFormOpen] = React.useState(false);
    const [todoToEdit, setTodoToEdit] = React.useState<IToDo | undefined>(undefined);
    const [searchQuery, setSearchQuery] = React.useState("");

    // Filter todos based on search query
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
                todoData.title || '',
                todoData.dueDate || new Date(),
                todoData.status || 'Pending',
                todoData.priority || 'Medium'
            );
        }
        onUpdate();
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
        project.updateToDo(id, { priority });
        onUpdate();
    };

    return (
        <div className="dashboard-card" style={{ flexGrow: 1 }}>
            {isFormOpen && (
                <TodoForm
                    onClose={() => {
                        setIsFormOpen(false);
                        setTodoToEdit(undefined);
                    }}
                    onSubmit={handleFormSubmit}
                    todoToEdit={todoToEdit}
                />
            )}
            <div
                style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '20px 30px',
                    borderBottom: '2px solid #3b3c3f'
                }}
            >
                <h4>To-Do</h4>
                <SearchBox 
                    onChange={setSearchQuery} 
                    placeholder="Search todos..." 
                />
                <button id="ToDoAdd-Btn" onClick={handleAddTodo}>
                    <span className="material-symbols-rounded">add</span>
                    Add
                </button>
            </div>
            <div style={{ padding: '20px 30px', display: 'flex', flexDirection: 'column', rowGap: '15px' }}>
                {filteredTodos.length > 0 ? (
                    filteredTodos.map(todo => (
                        <ToDoCard
                            key={todo.id}
                            todo={todo}
                            onEdit={handleEditTodo}
                            onStatusChange={handleStatusChange}
                            onToggleComplete={handleToggleComplete}
                            onPriorityChange={handlePriorityChange}
                        />
                    ))
                ) : (
                    <p style={{ color: '#969696', textAlign: 'center' }}>
                        {searchQuery ? 'No todos match your search.' : 'No todos yet. Add one!'}
                    </p>
                )}
            </div>
        </div>
    );
}