import { v4 as uuidv4 } from 'uuid'

//* OWNS PROJECT DATA
export type ProjectStatus = "Pending" | "Active" | "Finished"
export type UserRole = "Architect" | "Engineer" | "Developer"
export type ToDoPriority = "Low" | "Medium" | "High"

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
  priority?: ToDoPriority
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
  cost: number
  progress: number
  id: string
  todos: IToDo[] = []

  constructor(data: IProject, id?: string) {
    this.name = data.name;
    this.description = data.description;
    this.status = data.status;
    this.userRole = data.userRole;
    this.finishDate = new Date(data.finishDate);
    this.cost = data.cost || 0;
    this.progress = data.progress || 0;
    // Prioritize the passed ID, then an existing ID, then generate a new one.
    this.id = id || (data as Project).id || uuidv4();
    this.iconInitials = data.name.match(/\b\p{L}/gu)?.join("").toUpperCase() || "";
    this.iconColorClass = getColorClassFromText(data.name);

    // If the data has a 'todos' array (from Firebase or another Project instance),
    // process it and ensure dates are correctly converted.
    const sourceTodos = (data as any).todos;
    if (sourceTodos && Array.isArray(sourceTodos)) {
      this.todos = sourceTodos.map((todo: any) => ({
        ...todo,
        dueDate: new Date(todo.dueDate.seconds ? todo.dueDate.toDate() : todo.dueDate)
      }));
    }
  }

  addToDo(title: string, dueDate: Date, status: ProjectStatus = "Pending", priority: ToDoPriority = "Medium", cost: number = 0, progress: number = 0): IToDo {
    const todo: IToDo = {
      id: uuidv4(),
      title,
      dueDate,
      completed: false,
      status,
      priority,
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

  updateToDoPriority(id: string, priority: ToDoPriority) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      todo.priority = priority
    }
  }

  updateToDo(id: string, data: Partial<IToDo>) {
    const todo = this.todos.find(t => t.id === id)
    if (todo) {
      if (data.title) todo.title = data.title
      if (data.dueDate) todo.dueDate = data.dueDate
      if (data.status) todo.status = data.status
      if (data.priority) todo.priority = data.priority
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