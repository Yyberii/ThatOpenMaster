import * as React from 'react'
import { ProjectsManager } from '../class/ProjectsManager'
import { useErrorModal } from './ErrorPage'
import { ProjectForm } from './ProjectForm'
import { Project, IProject } from '../class/Project'
import * as Router from "react-router-dom"
import { ThreeViewer } from './ThreeViewer'
import { deleteDocument } from '../firebase';
import { updateDocument } from '../firebase';
import { ProjectTasksList } from './ProjectTasksList' // Add this import

interface Props {
  projectsManager: ProjectsManager
}

export function ProjectDetailsPage(props: Props) {
  const routeParams = Router.useParams<{id: string}>()
  const [isEditing, setIsEditing] = React.useState(false)
  const [project, setProject] = React.useState<Project | null>(null)
  const [hasError, setHasError] = React.useState(false)
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
    if (routeParams.id) {
      const foundProject = props.projectsManager.getProject(routeParams.id)
      if (foundProject) {
        setProject(foundProject)
      } else {
        showError(`Project not found with ID ${routeParams.id}`)
        setHasError(true)
      }
    } else {
      showError("Project ID is needed to see this page")
      setHasError(true)
    }
  }, [routeParams.id, props.projectsManager.list])

  const handleEditClick = () => {
    setIsEditing(true)
  }

  const handleSave = (formData: IProject) => {
    if (!project) return
    props.projectsManager.updateProject(project.id, formData)
    setIsEditing(false)
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const handleProjectUpdate = () => {
    // This function is called anytime a To-Do is changed.
    // Update the state and save to Firebase here.
    setProject(prev => {
      if (!prev) return null;
      
      // Create a new instance to refresh the UI correctly
      const updatedProject = new Project(prev);

      // Save the entire updated project, including the todos array, to Firebase.
      // We use the toJSON() method to ensure data is in a storable format.
      props.projectsManager.onProjectUpdated(updatedProject.id, updatedProject.toJSON());
      
      return updatedProject;
    });
  };

  if (hasError || !project) {
    return <></>
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
              <button id="edit-project-btn" className="edit-project-btn" onClick={handleEditClick}>
                <span style={{ width: "100%" }}>Edit</span>
              </button>
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
          <div className="dashboard-card" style={{ flex: 1, minWidth: 300 }}>
            <ProjectTasksList 
              project={project} 
              onUpdate={handleProjectUpdate}
            />
          </div>
        </div>
        <ThreeViewer />
      </div>
    </div>
  )
}