import * as React from 'react'
import * as Router from 'react-router-dom';
import { ProjectsManager } from '../class/ProjectsManager'
import { useErrorModal } from './ErrorPage'
import { ProjectEditBtn } from './ProjectEditBtn'
import { ProjectEditPage } from './ProjectEditPage'
import { Project } from '../class/Project'
import { ToDoAdd } from './ToDos'

interface Props {
  projectsManager: ProjectsManager
}

export function ProjectDetailsPage(props: Props) {
  const routeParams = Router.useParams<{id: string}>()
  const [isEditing, setIsEditing] = React.useState(false)
  const [project, setProject] = React.useState<Project | null>(null)
  const [hasError, setHasError] = React.useState(false)
  const { show: showError } = useErrorModal()
  
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
    setHasError(false)
  }, [routeParams.id, props.projectsManager, showError])
  
  if (hasError || !project) {
    return <></>
  }
  
  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleSave = (formData: any) => {
    props.projectsManager.updateProject(project.id, formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleAddClick = () => {
  }

  if (isEditing) {
    return <ProjectEditPage project={project} onSave={handleSave} onCancel={handleCancel} />
  }

  return (
    <div className="page" id="project-details">
      <header>
        <div>
          <h2 data-project-info="name">{project.name}</h2>
          <p data-project-info="description" style={{ color: "#969696" }}>
            {project.description}
          </p>
        </div>
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
                HC
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
              <div className="todo-item">
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div
                    style={{ display: "flex", columnGap: 15, alignItems: "center" }}
                  >
                    <span
                      className="material-symbols-rounded"
                      style={{
                        padding: 10,
                        backgroundColor: "#686868",
                        borderRadius: 10
                      }}
                    >
                      construction
                    </span>
                    <p>Make anything here as you want, even something longer.</p>
                  </div>
                  <p style={{ textWrap: "nowrap", marginLeft: 10 }}>Fri, 20 sep</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div
          id="viewer-container"
          style={{ minWidth: 0 }}
          className="dashboard-card"
        ></div>
      </div>
    </div>

  )
}