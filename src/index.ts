import * as THREE from "three"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import { IProject, ProjectStatus, UserRole } from "./class/Project"
import { ProjectsManager } from "./class/ProjectsManager"
import { ErrorModal } from "./class/ErrorModal"
import { EditModal } from "./class/EditModal"
import { ToDoManager } from "./class/ToDoManager"

//* THIS GET UI AND DATA AND CONNECTS THEM TOGETHER

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

const errorModal = new ErrorModal

const editModal = new EditModal((formData) => {
  if (!projectsManager.activeProject) return
  try {
    projectsManager.updateProject(projectsManager.activeProject.id, formData)
  } catch (error) {
    errorModal.show((error as Error).message)
  }
}, (message: string) => { // This runs when validation fails, different from projectForm
  errorModal.show(message)
})

const projectForm = document.getElementById("new-project-form")
if (projectForm instanceof HTMLFormElement) {
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
            console.log(project)
            projectForm.reset()
            toggleModal("new-project-model")
        } catch (error) {
            errorModal.show((error as Error).message) //shows error modal with the error message from the ProjectsManager.ts
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

const editProjectBtn = document.getElementById("edit-project-btn")
if (editProjectBtn) {
    editProjectBtn.addEventListener("click", () => {
        if (!projectsManager.activeProject) {
            console.warn("No active project to edit")
            return
        }
        console.log(projectsManager.activeProject)
        editModal.show(projectsManager.activeProject)

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


//ThreeJS viewer
const scene = new THREE.Scene()

const viewerContainer = document.getElementById("viewer-container") as HTMLElement

const camera = new THREE.PerspectiveCamera(75)
camera.position.z = 5

const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
viewerContainer.append(renderer.domElement)

function resizeViewer() {
    const containerDimensions = viewerContainer.getBoundingClientRect()
    renderer.setSize(containerDimensions.width, containerDimensions.height)
    const aspectRatio = containerDimensions.width / containerDimensions.height
    camera.aspect = aspectRatio
    camera.updateProjectionMatrix()
}

window.addEventListener("resize", resizeViewer)

resizeViewer()

const BoxGeometry = new THREE.BoxGeometry()
const material = new THREE.MeshStandardMaterial()
const cube = new THREE.Mesh(BoxGeometry, material)

const directionalLight = new THREE.DirectionalLight()
const ambientLight = new THREE.AmbientLight()
ambientLight.intensity = 0.4

// white spotlight shining from the side, modulated by a texture
const spotLight = new THREE.SpotLight(0xffffff, 1);
spotLight.position.set(10, 10, 10);
spotLight.castShadow = true;
spotLight.shadow.mapSize.width = 1024;
spotLight.shadow.mapSize.height = 1024;
spotLight.shadow.camera.near = 500;
spotLight.shadow.camera.far = 4000;
spotLight.shadow.camera.fov = 10;


scene.add(directionalLight, ambientLight, spotLight)

const cameraControls = new OrbitControls(camera, viewerContainer)


function renderScene() {
    renderer.render(scene, camera) 
    requestAnimationFrame (renderScene)
}

renderScene()

const axes = new THREE.AxesHelper()
const grid = new THREE.GridHelper()
grid.material.transparent = true
grid.material.opacity = 0.4
grid.material.color = new THREE.Color("#808080")
scene.add(axes, grid)

const gui = new GUI()

const cubeControls = gui.addFolder("Cube")
cubeControls.add(cube.position, "x", -10, 10, 1)
cubeControls.add(cube.position, "y", -10, 10, 1)
cubeControls.add(cube.position, "z", -10, 10, 1)
cubeControls.add(cube, "visible")
cubeControls.addColor(cube.material, "color")

const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 2);
scene.add(lightHelper);

const lightControls = gui.addFolder("Lights")
lightControls.add(directionalLight.position, "x", -10, 10, 1)
lightControls.add(directionalLight.position, "y", -10, 10, 1)
lightControls.add(directionalLight.position, "z", -10, 10, 1)
lightControls.add(directionalLight, "intensity", 0, 2, 0.1)
lightControls.addColor(directionalLight, "color")

const objLoader = new OBJLoader()
const mtlLoader = new MTLLoader()


mtlLoader.load("../assets/Gear/Gear1.mtl", (materials) => {
    materials.preload()
    objLoader.setMaterials(materials)
    objLoader.load("../assets/Gear/Gear1.obj", (mesh) => {
        scene.add(mesh)
    })
})

const gltfLoader = new GLTFLoader()
const gltf = await gltfLoader.loadAsync("../assets/Donut/Donut.glb")
scene.add(gltf.scene)
