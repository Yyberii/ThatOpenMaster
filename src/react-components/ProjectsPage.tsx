import * as React from 'react';
import { IProject, Project, ProjectStatus, UserRole } from "../class/Project"
import { ProjectsManager } from "../class/ProjectsManager"
import { ProjectCard } from "./ProjectCard"
import * as Router from 'react-router-dom';
import { useErrorModal } from './ErrorPage';

interface Props {
  projectsManager: ProjectsManager
}

export function ProjectsPage(props: Props) {
  const { show: showError } = useErrorModal()

  const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.list)
  props.projectsManager.onProjectCreated = () => {setProjects([...props.projectsManager.list])}
  props.projectsManager.onProjectDeleted = () => {setProjects([...props.projectsManager.list])}

  const projectCards = projects.map((project) => {
    return (
      <Router.Link to={`/project/${project.id}`} key={project.id}>
        <ProjectCard project={project} />
      </Router.Link>
    )
  })

  React.useEffect(() => {
    console.log("Projects updated:", projects)
  }, [projects]) 

  const onNewProjectClick = () => {
    const modal = document.getElementById("new-project-model")
    if (!(modal && modal instanceof HTMLDialogElement)) { return }
    modal.showModal()
  }

  const onFormSubmit = (e: React.FormEvent) => {
    const projectForm = document.getElementById("new-project-form")
    if (!(projectForm && projectForm instanceof HTMLFormElement)) {return}
    e.preventDefault()
    const formData = new FormData(projectForm)
    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: new Date(formData.get("finishDate") as string)
    }
    try {
      const project = props.projectsManager.newProject(projectData)
      projectForm.reset()
      const modal = document.getElementById("new-project-model")
      if (!(modal && modal instanceof HTMLDialogElement)) { return }
      modal.close()
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err))
    }
  }

  const onImportProject = () => {
    props.projectsManager.importFromJSON()
  }

  const onExportProject = () => {
    props.projectsManager.exportToJSON()
  }

  return (
    <div className="page" id="projects-page" style={{ display: "flex" }}>
      <dialog id="new-project-model">
        <form onSubmit={(e) => {onFormSubmit(e)}} id="new-project-form">
          <h2>New Project</h2>
          <div className="input-list">
            <div className="form-field-container">
              <label>
                <span className="material-symbols-rounded">apartment</span>Name
              </label>
              <input
                name="name"
                type="text"
                placeholder="What's the name of your project?"
              />
              <p
                style={{
                  color: "gray",
                  fontSize: "var(--font-sm)",
                  marginTop: 5,
                  fontStyle: "italic"
                }}
              >
                TIP: Give it a short name
              </p>
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-symbols-rounded">subject</span>Description
              </label>
              <textarea
                name="description"
                cols={30}
                rows={5}
                placeholder="Give your project a nice description! So people is jealous about it."
                defaultValue={""}
              />
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-symbols-rounded">person</span>Role
              </label>
              <select name="userRole">
                <option>Architect</option>
                <option>Engineer</option>
                <option>Developer</option>
              </select>
            </div>
            <div className="form-field-container">
              <label>
                <span className="material-symbols-rounded">
                  not_listed_location
                </span>
                Status
              </label>
              <select name="status">
                <option>Pending</option>
                <option>Active</option>
                <option>Finished</option>
              </select>
            </div>
            <div className="form-field-container">
              <label htmlFor="finishDate">
                <span className="material-symbols-rounded">calendar_month</span>
                Finish Date
              </label>
              <input name="finishDate" type="date" />
            </div>
            <div
              style={{
                display: "flex",
                margin: "10px 0px 10px auto",
                columnGap: 10
              }}
            >
              <button
                id="cancel-btn"
                type="button"
                style={{ backgroundColor: "transparent" }}
              >
                Cancel
              </button>
              <button type="submit" style={{ backgroundColor: "rgb(18, 145, 18)" }}>
                Accept
              </button>
            </div>
          </div>
        </form>
      </dialog>
      <header>
        <h2>Projects</h2>
        <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
          <span 
            id="import-projects-btn"
            className="material-symbols-rounded"
            style={{ textAlign: "center" }}
            onClick={onImportProject}
          >
            upload<div style={{ fontSize: "small" }}>Upload</div>
          </span>
          <span 
            id="export-projects-btn"
            className="material-symbols-rounded"
            style={{ textAlign: "center" }}
            onClick={onExportProject}
          >
            download<div style={{ fontSize: "small" }}>Download</div>
          </span>
          <button onClick={onNewProjectClick} id="new-project-btn">
            <span className="material-symbols-rounded">add</span>New project
          </button>
        </div>
      </header>
      <div id="projects-list">
        { projectCards }
        </div>
    </div>

  )
}