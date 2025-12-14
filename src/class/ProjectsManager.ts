import { IProject, Project } from "./Project"

export class ProjectsManager {
  list: Project[] = []
  ui: HTMLElement

constructor (container: HTMLElement) {
  this.ui = container
    this.newProject({
      name: "Default Project",
      description: "This is just a default app project",
      status: "pending",
      userRole: "architect",
      finishDate: new Date()
    })
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
    if (cost) { cost.textContent = project.cost.toString() }
    const role = detailsPage.querySelector("[data-project-info='role']")
    if (role) { role.textContent = project.userRole }
    const finishDate = detailsPage.querySelector("[data-project-info='finishDate']")
    if (finishDate) { finishDate.textContent = project.finishDate.toISOString().split('T')[0] }
  }

  getProject(id: string) {
    const project =  this.list.find((project) => {
      project.id === id
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
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'application/json'
    const reader = new FileReader()
    reader.addEventListener("load", () => {
      const json = reader.result
      if (!json) { return }
      const projects: IProject[] = JSON.parse(json as string)
      for (const project of projects) {
        try {
          this.newProject(project)
        } catch (error) {

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