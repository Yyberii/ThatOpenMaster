import { IProject, Project } from "./Project"
import { ToDoManager } from "./ToDoManager"

//* THIS IS FOR MANAGING DATA

export class ProjectsManager {
  list: Project[] = []
  ui: HTMLElement
  activeProject: Project | null = null

constructor (container: HTMLElement) {
  this.ui = container
  const project = this.newProject({
    name: "Default Project",
    description: "This is just a default app project",
    status: "Pending",
    userRole: "Architect",
    finishDate: new Date(),
    cost: 10000,
    progress: 10,
  })
  project.ui.click() // NEEDS TO BE DELETED AFTER TESTING
}

  newProject(data: IProject) {
    const projectNames = this.list.map((project) => {
      return project.name
    })
    const nameInUse = projectNames.includes(data.name)
    if (nameInUse) {
      throw new Error(`A project with the name "${data.name}" already exists`) //error message for modal
    }
    const project = new Project(data)
    project.ui.addEventListener("click", () => {
      this.activeProject = project   // for tracking the active project, used in index.ts for edit button
      const projectsPage = document.getElementById("projects-page")
      const detailsPage = document.getElementById("project-details")
      if (!(projectsPage && detailsPage)) { return }
      projectsPage.style.display = "none"
      detailsPage.style.display = "flex"
      this.setDetailsPage(project)
      this.setDashBoard(project)
    })
    this.ui.append(project.ui)
    this.list.push(project)
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
    
    // Refresh the UI card to reflect changes
    project.updateUIContent()
    
    // Update UI
    this.setDetailsPage(project)
    this.setDashBoard(project)
  }

  private setDetailsPage(project: Project) {
    const detailsPage = document.getElementById("project-details")
    if (!detailsPage) { return }
    const icon = detailsPage.querySelector("[data-project-info='project-icon']"
    ) as HTMLElement | null;

    if (icon) {
      icon.className = `project-icon ${project.iconColorClass}`;
      icon.textContent = project.iconInitials;
    }
    const name = detailsPage.querySelector("[data-project-info='name']")
    if (name) { name.textContent = project.name }
    const description = detailsPage.querySelector("[data-project-info='description']")
    if (description) { description.textContent = project.description }
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
    project.ui.remove()
    const remaining = this.list.filter((project) => {
      return project.id !== id
    })
    this.list = remaining
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
  
  importFromJSON() {
    const input = document.createElement('input') //*Creates input element
    input.type = 'file' //*Specifies that the input is for file selection
    input.accept = 'application/json' //*Restricts file types to JSON files
    const reader = new FileReader() //*Creates a FileReader to read the file content
    reader.addEventListener("load", () => { //*When file is loaded
      const json = reader.result //*Gets the file content that is set under result
      if (!json) { return } //*If no content, exit
      const projects: IProject[] = JSON.parse(json as string) //*Parses JSON content into array of project data
      for (const projectData of projects) { //*Iterates through each project data
        try { //*Tries to import each project
          const existingProject = this.list.find((p) => p.name === projectData.name) // Check if project with this name already exists
          if (existingProject) {
            // Update existing project
            this.updateProject(existingProject.id, projectData)
          } else {
            // Create new project using fromJSON to restore todos
            const project = Project.fromJSON(projectData)
            project.ui.addEventListener("click", () => {
              this.activeProject = project
              const projectsPage = document.getElementById("projects-page")
              const detailsPage = document.getElementById("project-details")
              if (!(projectsPage && detailsPage)) { return }
              projectsPage.style.display = "none"
              detailsPage.style.display = "flex"
              this.setDetailsPage(project)
              this.setDashBoard(project)
            })
            this.ui.append(project.ui)
            this.list.push(project)
          }
        } catch (error) {
          console.error(`Failed to import project: ${error}`)
        }
      }
    })
    input.addEventListener("change", () => { //*When user selects a file
      const filesList = input.files //*Gets the list of selected files
      if (!filesList) { return } //*If no files, exit
      reader.readAsText(filesList[0]) //*Reads the first selected file as text
    })
    input.click() //*Simulates a click to open the file dialog
  }


  getByname(name: string) {
    const project =  this.list.find((project) => {
      project.name === name
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