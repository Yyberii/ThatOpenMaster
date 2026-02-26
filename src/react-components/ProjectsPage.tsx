import * as React from 'react';
import * as Router from "react-router-dom"
import * as FireStore from "firebase/firestore"
import { IProject, Project } from "../class/Project"
import { ProjectsManager } from "../class/ProjectsManager"
import { ProjectCard } from "./ProjectCard"
import { useErrorModal } from "./ErrorPage"
import { SearchBox } from "./SearchBox"
import { getCollection } from '../firebase';
import { ProjectForm } from './ProjectForm';
import { appIcons } from '../globals';

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
        // Check by ID first, then by name
        let existingProject = props.projectsManager.getProject(doc.id)
        
        if (!existingProject) {
          // Check if project with same name exists (different ID)
          existingProject = props.projectsManager.getByname(project.name)
        }
        
        if (existingProject) {
          // Update existing project (sync Firestore data)
          existingProject.id = doc.id  // Ensure Firebase ID is used
          props.projectsManager.updateProject(doc.id, project)
        } else {
          // Create new project
          props.projectsManager.newProject(project, doc.id)
        }
      } catch (err) {
        console.warn(`Failed to sync project ${doc.id}:`, err instanceof Error ? err.message : err)
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
    setShowProjectForm(true)
  }

  const onFormSubmit = async (projectData: IProject) => {
    try {
      // Add the project data to Firebase first to get the real document ID.
      const docRef = await FireStore.addDoc(projectsCollection, projectData as any);

      // Use the real Firebase ID to create the project locally.
      props.projectsManager.newProject(projectData, docRef.id);
      
      setShowProjectForm(false);
    } catch (err) {
      showError(err instanceof Error ? err.message : String(err));
    }
  }

  const onCancelClick = () => {
    setShowProjectForm(false)
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

  const [showProjectForm, setShowProjectForm] = React.useState(false)

  return (
    <div className="page" id="projects-page" style={{ display: "flex" }}>
      <header>
        <bim-label style={{ fontSize: "1.3rem", color: "white" }}>Projects List</bim-label>
        <div style={{ width: "40%" }}>
          <SearchBox onChange={(value) => onProjectSearch(value)} />
        </div>
        <div style={{ display: "flex", alignItems: "center", columnGap: 15 }}>
          <bim-button onclick={onImportProject} icon={appIcons.UPLOAD} label="Upload"></bim-button>
          <bim-button onclick={onExportProject} icon={appIcons.DOWNLOAD} label="Download"></bim-button>
          <bim-button onclick={onNewProjectClick} icon={appIcons.ADD} label="New project"></bim-button>
        </div>
      </header>
      {
        projects.length > 0 ? <div id="projects-list">{projectCards}</div> : <p style={{ textAlign: "center", color: "red", fontSize: "var(--font-large)" }}>No projects found.</p>
      } 
      {showProjectForm && (
        <ProjectForm 
          onSubmit={onFormSubmit} 
          onClose={onCancelClick} 
        />
      )}
    </div>
  )
}