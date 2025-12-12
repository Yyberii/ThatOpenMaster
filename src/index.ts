import { IProject, ProjectStatus, UserRole } from "./class/Project"
import { ProjectsManager } from "./class/ProjectsManager"

function toggleModal(id: string) {
    const modal =  document.getElementById(id)
    if (modal && modal instanceof HTMLDialogElement) {
        if (modal.open) {
            modal.close()
        } else {
            modal.showModal()
        }
    } else {
        console.warn("The provided modal wasn't found. ID: ", id)
    }
}

const cancelBtn = document.getElementById("cancel-btn")
if (cancelBtn){
    cancelBtn.addEventListener("click",  () => toggleModal ("new-project-model"))
} else {
    console.warn("Cancel button not found")
}

const projectsListUI = document.getElementById("projects-list") as HTMLElement
const projectsManager = new ProjectsManager(projectsListUI)

// This document object is provided by the browser, and its main purpose is to help us interarct with the DOM.
const newProjectBtn = document.getElementById("new-project-btn")
if (newProjectBtn){
    newProjectBtn.addEventListener("click",  () => toggleModal ("new-project-model"))
    // runs if true
} else {
    //runs if false
    console.warn("NewProjectBtn not found")
}

const projectForm = document.getElementById("new-project-form")
if (projectForm && projectForm instanceof HTMLFormElement) {
    projectForm.addEventListener("submit", (e) => {
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
            const project = projectsManager.newProject(projectData)
            projectForm.reset()
            toggleModal("new-project-model")
        } catch (error) {
            alert(error)
        }
    })
} else {
    console.warn("The project form was not found. Check the ID!")
}

const exportProjectsBtn = document.getElementById("export-projects-btn")
if (exportProjectsBtn) {
    exportProjectsBtn.addEventListener("click", () => {
        projectsManager.exportToJSON("projects.json")   
    })
}

const importProjectsBtn = document.getElementById("import-projects-btn")
if (importProjectsBtn) {
    importProjectsBtn.addEventListener("click", () => {
        projectsManager.importFromJSON()
    })
}

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