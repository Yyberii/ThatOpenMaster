import { v4 as uuidv4 } from 'uuid'

//* OWNS PROJECT DATA
export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"

export interface IProject {
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date
  iconInitials?: string //* no nesessary, thats why the ? mark. Will be created automatically
  iconColorClass?: string //* no nesessary, thats why the ? mark. Will be created automatically
  cost?: number
  progress?: number
}

// Project card icon colors
const ICON_COLOR_CLASSES = [
  "icon-blue",
  "icon-green",
  "icon-orange",
  "icon-purple",
  "icon-red",
  "icon-teal"
];

function getColorClassFromText(text: string): string {
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    hash = text.charCodeAt(i) + ((hash << 5) - hash);
  }
  return ICON_COLOR_CLASSES[Math.abs(hash) % ICON_COLOR_CLASSES.length];
}

export { getColorClassFromText }

export interface IToDo {
  id: string
  title: string
  dueDate: Date
  completed: boolean
  status: ProjectStatus
}

const DEFAULT_FINISH_DATE = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000
);

export class Project implements IProject {
  //to satisfy the IProject
  iconInitials: string
  iconColorClass: string
  name: string
  description: string
  status: ProjectStatus
  userRole: UserRole
  finishDate: Date


  //Class internals
  ui!: HTMLDivElement
  cost: number = 0
  progress: number = 0
  id: string
  todos: IToDo[] = []

  

  constructor(data: Omit<IProject, "iconInitials" | "iconColorClass"> & {
    finishDate?: Date;
    }
  ) {
    //input validation in which the app doesn’t create a project if the name length is less than 5 characters. Counts spaces as well.
    if (data.name.length < 5) {
      throw new Error("Project name cannot be under 5 characters long");
    }
    this.name = data.name;
    this.description = data.description;
    this.status = data.status;
    this.userRole = data.userRole;
    if (data.finishDate instanceof Date && !isNaN(data.finishDate.getTime())) { // check is date is given and if not then use default date
      this.finishDate = data.finishDate;
    } else {
      this.finishDate = DEFAULT_FINISH_DATE;
    }
    
    // for icons to work
    this.iconInitials = this.name
      .match(/\b\p{L}/gu)
      ?.join("")
      .toUpperCase() || "";

    this.iconColorClass = getColorClassFromText(this.name);

    this.cost = data.cost ?? 0;
    this.progress = data.progress ?? 0;

    this.id = uuidv4();
    this.setUI();
  }

  // creates the project card UI
  setUI() {
    if (this.ui) {return}
    this.ui = document.createElement("div")
    this.ui.className = "project-card"
    this.updateUIContent()
  }

  // updates the content of the UI without recreating the element
  updateUIContent() {
    const initials = this.name
      .match(/\b\p{L}/gu)
      ?.join("")
      .toUpperCase() || "";
    const colorClass = getColorClassFromText(this.name);
    this.ui.className = `project-card`
    this.ui.innerHTML = `
    <div class="card-header">
      <p class="project-icon ${colorClass}">${initials}</p>
      <div>
        <h5>${this.name}</h5>
        <p>${this.description}</p>
      </div>
    </div>
    <div class="card-content">
      <div class="card-property">
        <p style="color: #969696;">Status</p>
        <p>${this.status}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Role</p>
        <p>${this.userRole}</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Cost</p>
        <p>${this.cost} €</p>
      </div>
      <div class="card-property">
        <p style="color: #969696;">Estimated Progress</p>
        <p>${this.progress} %</p>
      </div>
    </div>`
  }

  addToDo(title: string, dueDate: Date, status: ProjectStatus = "Pending"): IToDo {
    const todo: IToDo = {
      id: uuidv4(),
      title,
      dueDate,
      completed: false,
      status
    }
    this.todos.push(todo)
    return todo
  }

  deleteToDo(id: string) {
    this.todos = this.todos.filter(todo => todo.id !== id)
  }

  toggleToDo(id: string) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.completed = !todo.completed
    }
  }

  updateToDoStatus(id: string, status: ProjectStatus) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.status = status
    }
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      description: this.description,
      status: this.status,
      userRole: this.userRole,
      finishDate: this.finishDate.toISOString(),
      iconInitials: this.iconInitials,
      iconColorClass: this.iconColorClass,
      cost: this.cost,
      progress: this.progress,
      todos: this.todos.map(todo => ({
        ...todo,
        dueDate: todo.dueDate instanceof Date ? todo.dueDate.toISOString() : todo.dueDate
      }))
    }
  }

  static fromJSON(data: any): Project {
    const project = new Project({
      name: data.name,
      description: data.description,
      status: data.status,
      userRole: data.userRole,
      finishDate: new Date(data.finishDate),
      cost: data.cost,
      progress: data.progress
    })
    
    // Restore todos with proper Date objects
    if (data.todos && Array.isArray(data.todos)) {
      project.todos = data.todos.map((todo: any) => ({
        ...todo,
        dueDate: new Date(todo.dueDate)
      }))
    }
    
    return project
  }
}