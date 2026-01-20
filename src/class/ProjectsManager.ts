import { IProject, Project } from "./Project"
import { ToDoManager } from "./ToDoManager"
import * as FireStore from "firebase/firestore"
import { getCollection } from "../firebase"

//* THIS IS FOR MANAGING DATA

export class ProjectsManager {
  list: Project[] = []
  activeProject: Project | null = null
  onProjectCreated = (project: Project) => {}
  onProjectDeleted = (id: string) => {}
  onProjectUpdated = (id: string, data: any) => {}

filterProjects(value: string) {
  const filteredProjects = this.list.filter((project) => {
    return project.name.includes(value)
  })
  return filteredProjects
}

  newProject(data: IProject, id?: string) {
    if (data.name.length < 5) {
      throw new Error("Project name must be at least 5 characters long.")
    }
    const projectNames = this.list.map((project) => {
      return project.name
    })
    const nameInUse = projectNames.includes(data.name)
    if (nameInUse) {
      throw new Error(`A project with the name "${data.name}" already exists`)
    }
    const project = new Project(data)
    if (id) {
      project.id = id  // <- Use the Firebase ID if provided
    }
    this.list.push(project)
    this.onProjectCreated(project)
    return project
  }


  updateProject(id: string, data: any) {
    const project = this.list.find((p) => p.id === id)
    if (!project) {
      throw new Error(`Project with id "${id}" not found`)
    }
    
    // Update project properties
    if (data.name && data.name !== project.name) {
      // Check if name is already in use
      const projectNames = this.list.map((p) => p.name)
      if (projectNames.includes(data.name)) {
        throw new Error(`A project with the name "${data.name}" already exists`)
      }
      project.name = data.name
      // Recalculate initials and color when name changes
      project.iconInitials = project.name
        .match(/\b\p{L}/gu)
        ?.join("")
        .toUpperCase() || ""
    }
    if (data.description) project.description = data.description
    if (data.status) project.status = data.status
    if (data.cost) project.cost = parseFloat(data.cost)
    if (data.userRole) project.userRole = data.userRole
    if (data.finishDate) project.finishDate = new Date(data.finishDate)
    if (data.progress !== undefined) project.progress = parseInt(data.progress)
    
    // Update UI
    this.setDashBoard(project)
    this.onProjectUpdated(id, data)
  }

  private setDashBoard(project: Project) {
    const detailsPage = document.getElementById("project-dashboard")
    if (!detailsPage) { return }
    const name = detailsPage.querySelector("[data-project-info='name']")
    if (name) { name.textContent = project.name }
    const description = detailsPage.querySelector("[data-project-info='description']")
    if (description) { description.textContent = project.description }
    const status = detailsPage.querySelector("[data-project-info='status']")
    if (status) { status.textContent = project.status }
    const cost = detailsPage.querySelector("[data-project-info='cost']")
    if (cost) { cost.textContent = `${project.cost} €` }
    const role = detailsPage.querySelector("[data-project-info='role']")
    if (role) { role.textContent = project.userRole }
    const finishDate = detailsPage.querySelector("[data-project-info='finishDate']")
    if (finishDate) { finishDate.textContent = project.finishDate.toISOString().split('T')[0] }
    const progress = detailsPage.querySelector("[data-project-info='progress']")
    if (progress) { progress.textContent = `${project.progress}%` }
    const progressBar = detailsPage.querySelector("#progress-bar") as HTMLElement | null
    if (progressBar) { progressBar.style.width = `${project.progress}%` }

    // Render to-dos for this project
    const todoManager = new ToDoManager(project)
    todoManager.render()
  }

  getProject(id: string) {
    const project =  this.list.find((project) => {
      return project.id === id
    })
    return project
  }

  deleteProject(id: string) {
    const project = this.getProject(id)
    if (!project) { return }
    const remaining = this.list.filter((project) => {
      return project.id !== id
    })
    this.list = remaining
    this.onProjectDeleted(id)
  }

  exportToJSON(filename: string = "projects") {
    const json = JSON.stringify(this.list, null, 2)
    const blob = new Blob([json], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }
  
  async importFromJSON() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    const reader = new FileReader()
    
    const projectsCollection = getCollection<IProject>("/projects")
    
    reader.addEventListener("load", async () => {
      const json = reader.result
      if (!json) { return }
      const projects: IProject[] = JSON.parse(json as string)
      
      for (const projectData of projects) {
        try {
          const existingProject = this.list.find((p) => p.name === projectData.name)
          
          if (existingProject) {
            // Update existing project in Firebase
            await FireStore.updateDoc(
              FireStore.doc(projectsCollection, existingProject.id),
              projectData as any
            )
            this.updateProject(existingProject.id, projectData)
          } else {
            // Create new project
            const project = Project.fromJSON(projectData)
            
            // Add to Firebase and get the document reference
            const docRef = await FireStore.addDoc(projectsCollection, {
              name: project.name,
              description: project.description,
              status: project.status,
              userRole: project.userRole,
              finishDate: project.finishDate,
              cost: project.cost,
              progress: project.progress
            })
            
            // Use Firebase ID
            project.id = docRef.id
            this.list.push(project)
            this.onProjectCreated(project)
          }
        } catch (error) {
          console.error(`Failed to import project: ${error}`)
        }
      }
    })
    
    input.addEventListener("change", () => {
      const filesList = input.files
      if (!filesList) { return }
      reader.readAsText(filesList[0])
    })
    input.click()
  }

  getByname(name: string) {
    const project = this.list.find((project) => {
      return project.name === name
    })
    return project
  }

  totalCost() {
    const projectCost = this.list.reduce((total, item) => {
      return total + item.cost
    }, 0)
    return projectCost  
  } 

}