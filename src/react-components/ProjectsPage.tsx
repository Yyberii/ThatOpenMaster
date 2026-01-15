import * as React from 'react';
import * as Router from "react-router-dom"
import * as FireStore from "firebase/firestore"
import { IProject, Project, ProjectStatus, UserRole } from "../class/Project"
import { ProjectsManager } from "../class/ProjectsManager"
import { ProjectCard } from "./ProjectCard"
import { useErrorModal } from "./ErrorPage"
import { SearchBox } from "./SearchBox"
import { getCollection } from '../firebase';

interface Props {
  projectsManager: ProjectsManager
}

const projectsCollection = getCollection<IProject>("/projects")

export function ProjectsPage(props: Props) {
  const { show: showError } = useErrorModal()

  const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.list)
  props.projectsManager.onProjectCreated = () => {setProjects([...props.projectsManager.list])}
  props.projectsManager.onProjectUpdated = () => {setProjects([...props.projectsManager.list])}

  const getFirestoreProjects = async () => {
    const firebaseProjects = await FireStore.getDocs(projectsCollection)
    for (const doc of firebaseProjects.docs) {
      const data = doc.data()
      let finishDate: Date;
      const fbDate = data.finishDate as any;
      if (fbDate && typeof fbDate.toDate === 'function') {
        finishDate = fbDate.toDate();
      } else if (fbDate) {
        finishDate = new Date(fbDate);
      } else {
        finishDate = new Date();
      }
      const project: IProject = {
        ...data,
        finishDate
      }
      try {
        const existingProject = props.projectsManager.getProject(doc.id)
        if (existingProject) {
          props.projectsManager.updateProject(doc.id, project)
        } else {
          props.projectsManager.newProject(project, doc.id)
        }
      } catch (err) {
        console.error(err)
      }
    }
  }

  React.useEffect(() => {
    getFirestoreProjects()
  }, [])

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

  const onCancelClick = () => {
    const modal = document.getElementById("new-project-model")
    if (!(modal && modal instanceof HTMLDialogElement)) { return }
    modal.close()
  }

  const onFormSubmit = (e: React.FormEvent) => {
    const projectForm = document.getElementById("new-project-form")
    if (!(projectForm && projectForm instanceof HTMLFormElement)) {return}
    e.preventDefault()
    const formData = new FormData(projectForm)

    const finishDateValue = formData.get("finishDate") as string;
    let finishDate = new Date();
    if (finishDateValue) {
      finishDate = new Date(finishDateValue);
    } else {
      finishDate.setDate(finishDate.getDate() + 30);
    }

    const projectData: IProject = {
      name: formData.get("name") as string,
      description: formData.get("description") as string,
      status: formData.get("status") as ProjectStatus,
      userRole: formData.get("userRole") as UserRole,
      finishDate: finishDate
    }
    try {
      const project = props.projectsManager.newProject(projectData)
      FireStore.addDoc(projectsCollection, projectData)
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

  const onProjectSearch = (value: string) => {
    setProjects(props.projectsManager.filterProjects(value))
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
                onClick={onCancelClick}
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
        <SearchBox onChange={(value) => onProjectSearch(value)} />
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
      {
        projects.length > 0 ? <div id="projects-list">{projectCards}</div> : <p style={{ textAlign: "center", color: "red", fontSize: "var(--font-large)" }}>No projects found.</p>
      } 
    </div>
  )
}