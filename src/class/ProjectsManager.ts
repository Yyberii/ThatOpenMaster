import { IProject, Project } from "./Project"
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
    const project = new Project(data, id) // Pass the id to the constructor
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
    this.onProjectUpdated(id, data)
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
    // Explicitly call the toJSON method for each project to ensure correct serialization
    const projectsAsJSON = this.list.map(project => project.toJSON());
    const json = JSON.stringify(projectsAsJSON, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }
  
  async importFromJSON() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    const reader = new FileReader();
    
    const projectsCollection = getCollection<IProject>("/projects");
    
    reader.addEventListener("load", async () => {
      const json = reader.result;
      if (!json) { return; }
      const projectsFromFile: any[] = JSON.parse(json as string);
      
      for (const projectData of projectsFromFile) {
        try {
          // Use the Project class's own fromJSON method to correctly parse the data
          const projectToImport = Project.fromJSON(projectData);
          const existingProject = this.getByname(projectToImport.name);
          
          if (existingProject) {
            // --- UPDATE EXISTING PROJECT ---
            // Merge the imported data into the existing project instance
            existingProject.description = projectToImport.description;
            existingProject.status = projectToImport.status;
            existingProject.userRole = projectToImport.userRole;
            existingProject.finishDate = projectToImport.finishDate;
            existingProject.cost = projectToImport.cost;
            existingProject.progress = projectToImport.progress;
            existingProject.todos = projectToImport.todos; // Overwrite todos

            // Use setDoc to completely overwrite the document in Firebase with the updated data
            const docRef = FireStore.doc(projectsCollection, existingProject.id);
            const dataToSave = {
              name: existingProject.name,
              description: existingProject.description,
              status: existingProject.status,
              userRole: existingProject.userRole,
              finishDate: existingProject.finishDate,
              iconInitials: existingProject.iconInitials,
              iconColorClass: existingProject.iconColorClass,
              cost: existingProject.cost,
              progress: existingProject.progress,
              todos: existingProject.todos.map(todo => ({
                ...todo,
                dueDate: todo.dueDate instanceof Date ? todo.dueDate : new Date(todo.dueDate)
              }))
            };
            await FireStore.setDoc(docRef, dataToSave);

            // Notify the UI that an update happened
            this.onProjectUpdated(existingProject.id, existingProject.toJSON());

          } else {
            // --- CREATE NEW PROJECT ---
            // The project doesn't exist locally, so we'll create it in Firebase.
            // The 'id' from the JSON file is ignored to prevent conflicts.
            const newProjectData = projectToImport.toJSON();
            delete (newProjectData as any).id; // Let Firebase generate a new ID

            const dataToSave = {
              ...newProjectData,
              finishDate: projectToImport.finishDate,
              todos: projectToImport.todos.map(todo => ({
                ...todo,
                dueDate: todo.dueDate instanceof Date ? todo.dueDate : new Date(todo.dueDate)
              }))
            };

            const docRef = await FireStore.addDoc(projectsCollection, dataToSave);
            
            // Now, create the project locally using the new, real ID from Firebase
            this.newProject(projectToImport, docRef.id);
          }
        } catch (error) {
          console.error(`Failed to import project "${projectData.name}":`, error);
        }
      }
    });
    
    input.addEventListener("change", () => {
      const filesList = input.files;
      if (!filesList) { return; }
      reader.readAsText(filesList[0]);
    });
    input.click();
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