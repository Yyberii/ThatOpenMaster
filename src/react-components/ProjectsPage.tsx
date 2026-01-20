import * as React from 'react'
import * as Router from 'react-router-dom'
import * as FireStore from 'firebase/firestore'
import { ProjectsManager } from '../class/ProjectsManager'
import { IProject } from '../class/Project'
import { ProjectCard } from './ProjectCard'
import { SearchBox } from './SearchBox'
import { useErrorModal } from './ErrorPage'
import { getCollection } from '../firebase'
import { ProjectForm } from './ProjectForm'

interface Props {
  projectsManager: ProjectsManager
}

const projectsCollection = getCollection<IProject>("/projects")

export function ProjectsPage(props: Props) {
  const { show: showError } = useErrorModal()

  const [projects, setProjects] = React.useState<Project[]>(props.projectsManager.list)
  const [isFormOpen, setIsFormOpen] = React.useState(false)
  
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
    setIsFormOpen(true)
  }

  const onFormClose = () => {
    setIsFormOpen(false)
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
      {isFormOpen && (
        <ProjectForm
          onClose={onFormClose}
          projectsManager={props.projectsManager}
        />
      )}
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