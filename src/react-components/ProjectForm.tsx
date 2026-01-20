import * as React from 'react';
import * as FireStore from 'firebase/firestore';
import { IProject, Project } from '../class/Project';
import { ProjectsManager } from '../class/ProjectsManager';
import { getCollection, updateDocument } from '../firebase';
import { useErrorModal } from './ErrorPage';

interface Props {
    onClose: () => void;
    projectsManager: ProjectsManager;
    projectToEdit?: Project;
}

const projectsCollection = getCollection<IProject>("/projects");

export function ProjectForm(props: Props) {
    const dialogRef = React.useRef<HTMLDialogElement>(null);
    const { show: showError } = useErrorModal();

    const [formData, setFormData] = React.useState<IProject>(() => {
        if (props.projectToEdit) {
            return {
                name: props.projectToEdit.name,
                description: props.projectToEdit.description,
                status: props.projectToEdit.status,
                userRole: props.projectToEdit.userRole,
                finishDate: new Date(props.projectToEdit.finishDate),
                cost: props.projectToEdit.cost,
                progress: props.projectToEdit.progress
            };
        }
        return {
            name: "",
            description: "",
            status: "Pending",
            userRole: "Architect",
            finishDate: new Date()
        };
    });

    React.useEffect(() => {
        if (dialogRef.current && !dialogRef.current.open) {
            dialogRef.current.showModal();
        }
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({ ...prev, finishDate: new Date(e.target.value) }));
    };

    const onFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const dataToSubmit: IProject = { ...formData };
        
        // Validate and set finish date
        if (!formData.finishDate || isNaN(new Date(formData.finishDate).getTime())) {
            const thirtyDaysFromNow = new Date();
            thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
            dataToSubmit.finishDate = thirtyDaysFromNow;
        }

        try {
            if (props.projectToEdit) {
                // Update existing project
                props.projectsManager.updateProject(props.projectToEdit.id, dataToSubmit);
                await updateDocument<Partial<IProject>>("projects", props.projectToEdit.id, dataToSubmit);
            } else {
                // Create new project
                const project = props.projectsManager.newProject(dataToSubmit);
                await FireStore.addDoc(projectsCollection, dataToSubmit);
            }
            props.onClose();
        } catch (err) {
            showError(err instanceof Error ? err.message : String(err));
        }
    };

    const finishDateString = formData.finishDate ? new Date(formData.finishDate).toISOString().split('T')[0] : "";

    return (
        <dialog ref={dialogRef} id="new-project-model" onClose={props.onClose}>
            <form onSubmit={onFormSubmit} id="new-project-form">
                <h2>{props.projectToEdit ? "Edit Project" : "New Project"}</h2>
                <div className="input-list">
                    <div className="form-field-container">
                        <label><span className="material-symbols-rounded">apartment</span>Name</label>
                        <input 
                            name="name" 
                            type="text" 
                            placeholder="What's the name of your project?" 
                            value={formData.name} 
                            onChange={handleInputChange}
                            required
                        />
                        <p style={{ color: "gray", fontSize: "var(--font-sm)", marginTop: 5, fontStyle: "italic" }}>
                            TIP: Give it a short name
                        </p>
                    </div>
                    <div className="form-field-container">
                        <label><span className="material-symbols-rounded">subject</span>Description</label>
                        <textarea 
                            name="description" 
                            cols={30} 
                            rows={5} 
                            placeholder="Give your project a nice description!" 
                            value={formData.description} 
                            onChange={handleInputChange}
                        />
                    </div>
                    <div className="form-field-container">
                        <label><span className="material-symbols-rounded">person</span>Role</label>
                        <select name="userRole" value={formData.userRole} onChange={handleInputChange}>
                            <option>Architect</option>
                            <option>Engineer</option>
                            <option>Developer</option>
                        </select>
                    </div>
                    <div className="form-field-container">
                        <label><span className="material-symbols-rounded">not_listed_location</span>Status</label>
                        <select name="status" value={formData.status} onChange={handleInputChange}>
                            <option>Pending</option>
                            <option>Active</option>
                            <option>Finished</option>
                        </select>
                    </div>
                    <div className="form-field-container">
                        <label htmlFor="finishDate"><span className="material-symbols-rounded">calendar_month</span>Finish Date</label>
                        <input name="finishDate" type="date" value={finishDateString} onChange={handleDateChange} />
                    </div>
                    {props.projectToEdit && (
                        <>
                            <div className="form-field-container">
                                <label><span className="material-symbols-rounded">attach_money</span>Cost</label>
                                <input 
                                    name="cost" 
                                    type="number" 
                                    placeholder="Project cost" 
                                    value={formData.cost || 0} 
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-field-container">
                                <label><span className="material-symbols-rounded">percent</span>Progress</label>
                                <input 
                                    name="progress" 
                                    type="number" 
                                    min="0" 
                                    max="100" 
                                    placeholder="Project progress %" 
                                    value={formData.progress || 0} 
                                    onChange={handleInputChange}
                                />
                            </div>
                        </>
                    )}
                    <div style={{ display: "flex", margin: "10px 0px 10px auto", columnGap: 10 }}>
                        <button id="cancel-btn" type="button" style={{ backgroundColor: "transparent" }} onClick={props.onClose}>
                            Cancel
                        </button>
                        <button type="submit" style={{ backgroundColor: "rgb(18, 145, 18)" }}>
                            {props.projectToEdit ? "Update" : "Create"}
                        </button>
                    </div>
                </div>
            </form>
        </dialog>
    );
}