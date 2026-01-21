import * as React from 'react';
import { IToDo, ToDoPriority, ProjectStatus } from '../class/Project';

interface Props {
    todo: IToDo;
    onEdit: (todo: IToDo) => void;
    onStatusChange: (id: string, status: ProjectStatus) => void;
    onToggleComplete: (id: string) => void;
    onPriorityChange: (id: string, priority: ToDoPriority) => void;
}

export function ToDoCard({ todo, onEdit, onStatusChange, onToggleComplete, onPriorityChange }: Props) {
    const formattedDate = new Date(todo.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });

    const handleIconClick = (e: React.MouseEvent) => {
        e.stopPropagation(); // Prevent opening the edit form
        onToggleComplete(todo.id);
    };

    const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation(); // Prevent opening the edit form
        onStatusChange(todo.id, e.target.value as ProjectStatus);
    };

    const handlePriorityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        e.stopPropagation(); // Prevent opening the edit form
        onPriorityChange(todo.id, e.target.value as ToDoPriority);
    };

    const getIconStatusClass = (status: ProjectStatus) => {
        if (status === 'Finished') return 'icon-green';
        if (status === 'Active') return 'icon-blue';
        return 'icon-red'; // Pending
    };

    const getPriorityStyle = (priority: ToDoPriority) => {
        switch (priority) {
            case 'High':
                return { backgroundColor: '#ff1900', color: 'white' };
            case 'Medium':
                return { backgroundColor: '#f1994c', color: 'white' };
            case 'Low':
                return { backgroundColor: '#2ecc71', color: 'white' };
            default:
                return { backgroundColor: '#969696', color: 'white' };
        }
    };

    return (
        <div 
            className="todo-item"
            onClick={() => onEdit(todo)} 
            style={{ cursor: 'pointer' }}
        >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', columnGap: '15px', alignItems: 'center' }}>
                    <span 
                        className={`material-symbols-rounded ${getIconStatusClass(todo.status)}`} 
                        style={{ padding: '20px', borderRadius: '20px' }}
                        onClick={handleIconClick}
                    >
                        construction
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <p>
                            {todo.title}
                        </p>
                        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '4px' }}>
                            <select 
                                className="todo-status-select" 
                                value={todo.status} 
                                onClick={(e) => e.stopPropagation()}
                                onChange={handleStatusChange}
                                style={{ padding: '4px', borderRadius: '5px', border: '1px solid #404040', background: '#2a2a2a', color: 'white', fontSize: '12px', cursor: 'pointer', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none', textAlign: 'center'}}
                            >
                                <option value="Pending">Pending</option>
                                <option value="Active">Active</option>
                                <option value="Finished">Finished</option>
                            </select>
                            <select 
                                value={todo.priority} 
                                onClick={(e) => e.stopPropagation()}
                                onChange={handlePriorityChange}
                                style={{ 
                                    ...getPriorityStyle(todo.priority ?? 'Low'),
                                    padding: '4px 8px', 
                                    borderRadius: '5px', 
                                    fontSize: '12px',
                                    fontWeight: '500',
                                    border: 'none',
                                    cursor: 'pointer',
                                    appearance: 'none',
                                    WebkitAppearance: 'none',
                                    MozAppearance: 'none',
                                    textAlign: 'center',
                                }}
                            >
                                <option value="Low">Low</option>
                                <option value="Medium">Medium</option>
                                <option value="High">High</option>
                            </select>
                        </div>
                    </div>
                </div>
                <p style={{ textWrap: 'nowrap', marginLeft: '10px', margin: 0 }}>{formattedDate}</p>
            </div>
        </div>
    );
}