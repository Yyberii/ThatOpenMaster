import * as React from "react"
import * as ReactDOM from "react-dom/client"
import * as Router from "react-router-dom"
import { Sidebar } from "./react-components/Sidebar"
import { ProjectsPage } from "./react-components/ProjectsPage"
import * as THREE from "three"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
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


//ThreeJS viewer
// const scene = new THREE.Scene()

// const viewerContainer = document.getElementById("viewer-container") as HTMLElement

// const camera = new THREE.PerspectiveCamera(75)
// camera.position.z = 5

// const renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
// viewerContainer.append(renderer.domElement)

// function resizeViewer() {
//     const containerDimensions = viewerContainer.getBoundingClientRect()
//     renderer.setSize(containerDimensions.width, containerDimensions.height)
//     const aspectRatio = containerDimensions.width / containerDimensions.height
//     camera.aspect = aspectRatio
//     camera.updateProjectionMatrix()
// }

// window.addEventListener("resize", resizeViewer)

// resizeViewer()

// const BoxGeometry = new THREE.BoxGeometry()
// const material = new THREE.MeshStandardMaterial()
// const cube = new THREE.Mesh(BoxGeometry, material)

// const directionalLight = new THREE.DirectionalLight()
// const ambientLight = new THREE.AmbientLight()
// ambientLight.intensity = 0.4

// // white spotlight shining from the side, modulated by a texture
// const spotLight = new THREE.SpotLight(0xffffff, 1);
// spotLight.position.set(10, 10, 10);
// spotLight.castShadow = true;
// spotLight.shadow.mapSize.width = 1024;
// spotLight.shadow.mapSize.height = 1024;
// spotLight.shadow.camera.near = 500;
// spotLight.shadow.camera.far = 4000;
// spotLight.shadow.camera.fov = 10;


// scene.add(directionalLight, ambientLight, spotLight)

// const cameraControls = new OrbitControls(camera, viewerContainer)


// function renderScene() {
//     renderer.render(scene, camera) 
//     requestAnimationFrame (renderScene)
// }

// renderScene()

// const axes = new THREE.AxesHelper()
// const grid = new THREE.GridHelper()
// grid.material.transparent = true
// grid.material.opacity = 0.4
// grid.material.color = new THREE.Color("#808080")
// scene.add(axes, grid)

// const gui = new GUI()

// const cubeControls = gui.addFolder("Cube")
// cubeControls.add(cube.position, "x", -10, 10, 1)
// cubeControls.add(cube.position, "y", -10, 10, 1)
// cubeControls.add(cube.position, "z", -10, 10, 1)
// cubeControls.add(cube, "visible")
// cubeControls.addColor(cube.material, "color")

// const lightHelper = new THREE.DirectionalLightHelper(directionalLight, 2);
// scene.add(lightHelper);

// const lightControls = gui.addFolder("Lights")
// lightControls.add(directionalLight.position, "x", -10, 10, 1)
// lightControls.add(directionalLight.position, "y", -10, 10, 1)
// lightControls.add(directionalLight.position, "z", -10, 10, 1)
// lightControls.add(directionalLight, "intensity", 0, 2, 0.1)
// lightControls.addColor(directionalLight, "color")

// const objLoader = new OBJLoader()
// const mtlLoader = new MTLLoader()


// mtlLoader.load("../assets/Gear/Gear1.mtl", (materials) => {
//     materials.preload()
//     objLoader.setMaterials(materials)
//     objLoader.load("../assets/Gear/Gear1.obj", (mesh) => {
//         scene.add(mesh)
//     })
// })

// const gltfLoader = new GLTFLoader()
// const gltf = await gltfLoader.loadAsync("../assets/Donut/Donut.glb")
// scene.add(gltf.scene)
