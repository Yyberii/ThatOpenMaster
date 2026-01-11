import * as React from 'react';
import * as THREE from "three"
import { GUI } from "three/examples/jsm/libs/lil-gui.module.min.js"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { OBJLoader } from "three/examples/jsm/loaders/OBJLoader.js"
import { MTLLoader } from "three/examples/jsm/loaders/MTLLoader.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

export function ThreeViewer() {
  let scene: THREE.Scene | null
  let mesh: THREE.Object3D | null
  let renderer: THREE.WebGLRenderer | null
  let cameraControls: OrbitControls | null
  let camera: THREE.PerspectiveCamera | null
  let axes: THREE.AxesHelper | null
  let grid: THREE.GridHelper | null
  let directionalLight: THREE.DirectionalLight | null
  let ambientLight: THREE.AmbientLight | null
  let mtlLoader: MTLLoader | null
  let objLoader: OBJLoader | null
  let spotLight: THREE.SpotLight | null

  const setViewer = () => {
    scene = new THREE.Scene()
  
    const viewerContainer = document.getElementById("viewer-container") as HTMLElement
    
    camera = new THREE.PerspectiveCamera(75)
    camera.position.z = 5
    
    renderer = new THREE.WebGLRenderer({alpha: true, antialias: true})
    viewerContainer.append(renderer.domElement)
    
    function resizeViewer() {
      if (!renderer) return
        const containerDimensions = viewerContainer.getBoundingClientRect()
        renderer.setSize(containerDimensions.width, containerDimensions.height)
        const aspectRatio = containerDimensions.width / containerDimensions.height

        if (!camera) return
        camera.aspect = aspectRatio
        camera.updateProjectionMatrix()
    }
    
    window.addEventListener("resize", resizeViewer)
    
    resizeViewer()
    
    directionalLight = new THREE.DirectionalLight()
    ambientLight = new THREE.AmbientLight()
    ambientLight.intensity = 0.4
    
    // white spotlight shining from the side, modulated by a texture
    spotLight = new THREE.SpotLight(0xffffff, 1);
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
      if (!renderer || !scene || !camera) return
        renderer.render(scene, camera) 
        requestAnimationFrame (renderScene)
    }
    
    renderScene()
    
    axes = new THREE.AxesHelper()
    grid = new THREE.GridHelper()
    grid.material.transparent = true
    grid.material.opacity = 0.4
    grid.material.color = new THREE.Color("#808080")
    scene.add(axes, grid)
    
    objLoader = new OBJLoader()
    mtlLoader = new MTLLoader()
    
    
    mtlLoader.load("../assets/Gear/Gear1.mtl", (materials) => {
        materials.preload()
        if (!objLoader) return
        objLoader.setMaterials(materials)
        objLoader.load("../assets/Gear/Gear1.obj", (object) => {
          if (!scene) return
            scene.add(object)
            mesh = object
        })
    })
  }

  React.useEffect(() => {
    setViewer()
    return () => {
      mesh?.removeFromParent()
      mesh?.traverse((child) => {
        if (child instanceof THREE.Mesh) {
          child.geometry.dispose()
          child.material.dispose()
        }
      })
      mesh = null
    }
  }, [])

  return (
    <div
      id="viewer-container"
      style={{ minWidth: 0 }}
      className="dashboard-card"
    />
  )
}