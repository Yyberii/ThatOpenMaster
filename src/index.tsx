import * as ReactDOM from "react-dom/client"
import * as Router from "react-router-dom"
import { Sidebar } from "./react-components/Sidebar"
import { ProjectsPage } from "./react-components/ProjectsPage"
import { ErrorModalProvider } from "./react-components/ErrorPage"
import { ProjectDetailsPage } from "./react-components/ProjectDetailsPage"
import { ProjectsManager } from "./class/ProjectsManager"
import * as BUI from "@thatopen/ui"

BUI.Manager.init()

declare global {
  namespace JSX {
    interface IntrinsicElements {
      "bim-label": any;
      "bim-button": any;
      "bim-text-input": any;
      "bim-grid": any;
    }
  }
}

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
