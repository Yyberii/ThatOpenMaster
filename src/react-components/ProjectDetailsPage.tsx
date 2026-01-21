import * as React from 'react'
import * as Router from 'react-router-dom';
import { ProjectsManager } from '../class/ProjectsManager'
import { useErrorModal } from './ErrorPage'
import { ProjectEditBtn } from './ProjectEditBtn'
import { ProjectForm } from './ProjectForm'
import { Project, IProject } from '../class/Project'
import { IToDo } from '../class/Project'
import { ToDoManager } from '../class/ToDoManager'
import { ThreeViewer } from './ThreeViewer'
import { deleteDocument } from '../firebase';
import { updateDocument } from '../firebase';
import { TodoForm } from './ToDoForm'

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
  const { show: showError } = useErrorModal()

  const navigateTo = Router.useNavigate()
  
  props.projectsManager.onProjectDeleted = async (id) => {
    await deleteDocument("projects", id)
    navigateTo("/")
  }

  props.projectsManager.onProjectUpdated = async (id, data) => {
    await updateDocument<Partial<IProject>>("projects", id, data)
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

  const handleSave = (formData: IProject) => {
    props.projectsManager.updateProject(project.id, formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleAddClick = () => {
    setShowTodoForm(true)
  }

  const handleTodoSubmit = (todoData: Partial<IToDo>) => {
    if (todoData.title?.trim() && todoData.dueDate && todoManager) {
      todoManager.addToDo(
        todoData.title, 
        todoData.dueDate, 
        todoData.status || 'Pending',
        todoData.priority || 'Medium',
        todoData.cost || 0,
        todoData.progress || 0
      )
      setTodos([...project.todos])
      setShowTodoForm(false)
    }
  }

  const handleTodoCancel = () => {
    setShowTodoForm(false)
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


  if (isEditing) {
    return <ProjectForm projectToEdit={project} onSubmit={handleSave} onClose={handleCancel} />
  }

  return (
    <div className="page" id="project-details">
      {isEditing && (
        <ProjectForm 
          projectToEdit={project} 
          onSubmit={handleSave} 
          onClose={handleCancel} 
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
              <p data-project-info="project-icon " className={`project-icon ${project.iconColorClass}`}>
                {project.iconInitials}
              </p>
              <ProjectEditBtn onClick={handleEditClick} />
            </div>
            <div style={{ padding: "0 30px" }}>
              <div>
                <h5 data-project-info="name">{project.name}</h5>
                <p data-project-info="description">
                  {project.description}
                </p>
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
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Status
                  </p>
                  <p data-project-info="status">{project.status}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Cost
                  </p>
                  <p data-project-info="cost">{project.cost} €</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Role
                  </p>
                  <p data-project-info="role">{project.userRole}</p>
                </div>
                <div>
                  <p style={{ color: "#969696", fontSize: "var(--font-sm)" }}>
                    Finish Date
                  </p>
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
                  <p data-project-info="progress" style={{ textAlign: "center" }}>
                    {project.progress}%
                  </p>
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
                <span
                  id="ToDoAdd-Btn"
                  className="material-symbols-rounded"
                  onClick={handleAddClick}
                  style={{ cursor: 'pointer' }}
                >
                  add
                </span>
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
                <TodoForm 
                  onSubmit={handleTodoSubmit} 
                  onClose={handleTodoCancel} 
                />
              )}
              {todos.map(todo => (
                <div key={todo.id} className="todo-item">
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", columnGap: 15, alignItems: "center" }}>
                      <span
                        className="material-symbols-rounded"
                        onClick={() => handleTodoToggle(todo.id)}
                        style={{ padding: 10, backgroundColor: "#686868", borderRadius: 10, cursor: 'pointer' }}
                      >
                        construction
                      </span>
                      <p style={todo.completed ? { textDecoration: "line-through", color: "#808080" } : {}}>{todo.title}</p>
                    </div>
                    <p style={{ textWrap: "nowrap", marginLeft: 10 }}>{new Date(todo.dueDate).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}</p>
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