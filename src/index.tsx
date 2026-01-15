import * as React from "react"
import * as ReactDOM from "react-dom/client"
import * as Router from "react-router-dom"
import { Sidebar } from "./react-components/Sidebar"
import { ProjectsPage } from "./react-components/ProjectsPage"
import { ErrorModalProvider } from "./react-components/ErrorPage"
import { ToDoManager } from "./class/ToDoManager"
import { ProjectDetailsPage } from "./react-components/ProjectDetailsPage"
import { ProjectsManager } from "./class/ProjectsManager"


const projectsManager = new ProjectsManager()

const rootElement = document.getElementById("app") as HTMLElement
const appRoot = ReactDOM.createRoot(rootElement)
appRoot.render(
  <ErrorModalProvider>
    <Router.BrowserRouter>
      <Sidebar />
      <Router.Routes>
        <Router.Route path="/" element={<ProjectsPage projectsManager={projectsManager} />} />
        <Router.Route path="/project/:id" element={<ProjectDetailsPage projectsManager={projectsManager} />} />
      </Router.Routes>
    </Router.BrowserRouter>
  </ErrorModalProvider>
)

const backToProjectsBtn = document.getElementById("projects-nav-btn")
if (backToProjectsBtn) {
    backToProjectsBtn.addEventListener("click", () => {
        const projectsPage = document.getElementById("projects-page")
        const detailsPage = document.getElementById("project-details")
        if (!projectsPage || !detailsPage) { return }
        projectsPage.style.display = "flex"
        detailsPage.style.display = "none"
      })
}

const ToDoAddBtn = document.getElementById("ToDoAdd-Btn")
if (ToDoAddBtn) {
  ToDoAddBtn.addEventListener("click", () => {
    if (!projectsManager.activeProject) {
      console.warn("No active project to add to-do")
      return
    }
    const todoManager = new ToDoManager(projectsManager.activeProject)
    todoManager.render(true)
  })
}
