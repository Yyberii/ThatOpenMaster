import * as React from 'react';
import { IToDo } from '../class/Project';

interface Props {
    onClose: () => void;
    onSubmit: (todoData: Partial<IToDo>) => void;
    todoToEdit?: IToDo;
}

export function TodoForm(props: Props) {
    const [formData, setFormData] = React.useState<Partial<IToDo>>(() => {
        if (props.todoToEdit) {
            return { ...props.todoToEdit, dueDate: new Date(props.todoToEdit.dueDate) };
        }
        return {
            title: '',
            status: 'Pending',
            priority: 'Medium',
            dueDate: new Date()
        };
    });

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, dueDate: new Date(e.target.value) }));
    };

    const onFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        props.onSubmit(formData);
    };

    const dueDateString = formData.dueDate ? new Date(formData.dueDate).toISOString().split('T')[0] : "";

    return (
        <dialog open className="modal-backdrop" style={{ background: 'rgba(0,0,0,0.5)', border: 'none', width: '100%', height: '100%', position: 'fixed', top: 0, left: 0, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <form onSubmit={onFormSubmit} className="modal-content" style={{ background: '#2a2a2a', padding: '20px', borderRadius: '8px', color: 'white', width: '400px' }}>
                <h2>{props.todoToEdit ? "Edit To-Do" : "New To-Do"}</h2>
                <div className="input-list" style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div className="form-field-container">
                        <label>Title</label>
                        <input name="title" type="text" value={formData.title} onChange={handleInputChange} style={{ width: '100%', padding: '8px', background: '#404040', border: '1px solid #555', borderRadius: '4px', color: 'white' }} />
                    </div>
                    <div className="form-field-container">
                        <label>Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange} style={{ width: '100%', padding: '8px', background: '#404040', border: '1px solid #555', borderRadius: '4px', color: 'white' }}>
                            <option>Pending</option>
                            <option>Active</option>
                            <option>Finished</option>
                        </select>
                    </div>
                    <div className="form-field-container">
                        <label>Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleInputChange} style={{ width: '100%', padding: '8px', background: '#404040', border: '1px solid #555', borderRadius: '4px', color: 'white' }}>
                            <option>Low</option>
                            <option>Medium</option>
                            <option>High</option>
                        </select>
                    </div>
                    <div className="form-field-container">
                        <label>Due Date</label>
                        <input name="dueDate" type="date" value={dueDateString} onChange={handleDateChange} style={{ width: '100%', padding: '8px', background: '#404040', border: '1px solid #555', borderRadius: '4px', color: 'white' }} />
                    </div>
                    <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: '20px' }}>
                        <button type="button" onClick={props.onClose} style={{ padding: '10px 20px', background: 'transparent', border: '1px solid #555', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>Cancel</button>
                        <button type="submit" style={{ padding: '10px 20px', background: 'rgb(18, 145, 18)', border: 'none', borderRadius: '4px', color: 'white', cursor: 'pointer' }}>Accept</button>
                    </div>
                </div>
            </form>
        </dialog>
    );
}