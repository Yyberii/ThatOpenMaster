import * as React from 'react'
import * as Router from 'react-router-dom'
import { ProjectsManager } from '../class/ProjectsManager'
import { Project, IProject } from '../class/Project'
import { deleteDocument, updateDocument } from '../firebase'
import { useErrorModal } from './ErrorPage'
import { ToDoManager } from '../class/ToDoManager'
import { ThreeViewer } from './ThreeViewer'
import { ProjectEditBtn } from './ProjectEditBtn'
import { ToDoAdd } from './ToDos'
import { ProjectForm } from './ProjectForm'

interface Props {
  projectsManager: ProjectsManager
}

export function ProjectDetailsPage(props: Props) {
  const routeParams = Router.useParams<{id: string}>()
  const [isEditing, setIsEditing] = React.useState(false)
  const [project, setProject] = React.useState<Project | null>(null)
  const [hasError, setHasError] = React.useState(false)
  const [showTodoForm, setShowTodoForm] = React.useState(false)
  const [todos, setTodos] = React.useState<any[]>([])
  const [todoManager, setTodoManager] = React.useState<any>(null)
  const [formData, setFormData] = React.useState({ title: '', date: '', status: 'Pending' as 'Pending' | 'Active' | 'Finished' })
  const { show: showError } = useErrorModal()

  const navigateTo = Router.useNavigate()
  
  props.projectsManager.onProjectDeleted = async (id) => {
    await deleteDocument("projects", id)
    navigateTo("/")
  }

  props.projectsManager.onProjectUpdated = async (id, data) => {
    await updateDocument<Partial<IProject>>("projects", id, data)
    // Refresh project data
    const updatedProject = props.projectsManager.getProject(id)
    if (updatedProject) {
      setProject(updatedProject)
    }
  }
  
  React.useEffect(() => {
    if (!routeParams.id) {
      showError("Project ID is needed to see this page")
      setHasError(true)
      return
    }
    
    const foundProject = props.projectsManager.getProject(routeParams.id)
    if (!foundProject) {
      showError(`Project not found with ID ${routeParams.id}`)
      setHasError(true)
      return
    }
    
    setProject(foundProject)
    setTodos(foundProject.todos)
    setTodoManager(new ToDoManager(foundProject))
    setHasError(false)
  }, [routeParams.id, props.projectsManager, showError])
  
  if (hasError || !project) {
    return <></>
  }
  
  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleFormClose = () => {
    setIsEditing(false)
  }

  const handleAddClick = () => {
    setShowTodoForm(true)
  }

  const handleTodoSubmit = () => {
    if (formData.title.trim() && formData.date && todoManager) {
      todoManager.addToDo(formData.title, new Date(formData.date), formData.status)
      setTodos([...project.todos])
      setShowTodoForm(false)
      setFormData({ title: '', date: '', status: 'Pending' })
    }
  }

  const handleTodoCancel = () => {
    setShowTodoForm(false)
    setFormData({ title: '', date: '', status: 'Pending' })
  }

  const handleTodoToggle = (todoId: string) => {
    if (todoManager) {
      todoManager.toggleToDo(todoId)
      setTodos([...project.todos])
    }
  }

  const handleTodoStatusChange = (todoId: string, status: 'Pending' | 'Active' | 'Finished') => {
    if (todoManager) {
      todoManager.updateToDoStatus(todoId, status)
      setTodos([...project.todos])
    }
  }

  return (
    <div className="page" id="project-details">
      {isEditing && (
        <ProjectForm
          onClose={handleFormClose}
          projectsManager={props.projectsManager}
          projectToEdit={project}
        />
      )}
      <header>
        <div>
          <h2 data-project-info="name">{project.name}</h2>
          <p data-project-info="description" style={{ color: "#969696" }}>
            {project.description}
          </p>
        </div>
        <button style={{ backgroundColor: "red"}} onClick={() => props.projectsManager.deleteProject(project.id)}>Delete Project</button>
      </header>
      <div className="main-page-content">
        <div style={{ display: "flex", flexDirection: "column", rowGap: 30 }}>
          <div
            id="project-dashboard"
            className="dashboard-card"
            style={{ padding: "30px 0" }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "0 30px",
                marginBottom: 30
              }}
            >
              <p data-project-info="project-icon" className="project-icon">
                {project.iconInitials}
              </p>
              <ProjectEditBtn onClick={handleEditClick} />
            </div>
            <div style={{ padding: "0 30px" }}>
              <div>
                <h5 data-project-info="name">{project.name}</h5>
                <p data-project-info="description">{project.description}</p>
              </div>
              <div
                style={{
                  display: "flex",
                  columnGap: 30,
                  padding: "30px 0px",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <p style={{ color: "#969696", fontSize: 10 }}>Status</p>
                  <p data-project-info="status">{project.status}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: 10 }}>Role</p>
                  <p data-project-info="role">{project.userRole}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: 10 }}>Cost</p>
                  <p data-project-info="cost">{project.cost} €</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: 10 }}>Estimated Finish Date</p>
                  <p data-project-info="finishDate">{project.finishDate.toISOString().split('T')[0]}</p>
                </div>
              </div>
              <div
                style={{
                  backgroundColor: "#404040",
                  borderRadius: 100,
                  overflow: "auto"
                }}
              >
                <div
                  id="progress-bar"
                  style={{
                    width: `${project.progress}%`,
                    backgroundColor: "green",
                    padding: "4px 0"
                  }}
                >
                  <p data-project-info="progress" style={{ textAlign: "center", color: "white" }}>{project.progress}%</p>
                </div>
              </div>
            </div>
          </div>
          <div className="dashboard-card" style={{ flexGrow: 1 }}>
            <div
              style={{
                padding: "20px 30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between"
              }}
            >
              <h4>To-Do List</h4>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "end",
                  columnGap: 20
                }}
              >
                <div
                  style={{ display: "flex", alignItems: "center", columnGap: 10 }}
                >
                  <span className="material-symbols-rounded">search</span>
                  <input
                    type="text"
                    placeholder="Search To-Do's by name"
                    style={{ width: "100%" }}
                  />
                </div>
                <ToDoAdd onClick={handleAddClick} />
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                padding: "10px 30px",
                rowGap: 20
              }}
            >
              {showTodoForm && (
                <div style={{ padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                  <input
                    type="text"
                    placeholder="Task title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    style={{ width: '100%', marginBottom: '10px' }}
                  />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={{ width: '100%', marginBottom: '10px' }}
                  />
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                    style={{ width: '100%', marginBottom: '10px' }}
                  >
                    <option>Pending</option>
                    <option>Active</option>
                    <option>Finished</option>
                  </select>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button onClick={handleTodoSubmit} style={{ flex: 1, backgroundColor: 'green' }}>Add</button>
                    <button onClick={handleTodoCancel} style={{ flex: 1, backgroundColor: 'transparent' }}>Cancel</button>
                  </div>
                </div>
              )}
              {todos.map(todo => (
                <div key={todo.id} style={{ padding: '15px', backgroundColor: '#2a2a2a', borderRadius: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <input
                        type="checkbox"
                        checked={todo.completed}
                        onChange={() => handleTodoToggle(todo.id)}
                      />
                      <span style={{ textDecoration: todo.completed ? 'line-through' : 'none' }}>
                        {todo.title}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <span>{new Date(todo.dueDate).toLocaleDateString()}</span>
                      <select
                        value={todo.status}
                        onChange={(e) => handleTodoStatusChange(todo.id, e.target.value as any)}
                      >
                        <option>Pending</option>
                        <option>Active</option>
                        <option>Finished</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <ThreeViewer />
      </div>
    </div>
  )
}