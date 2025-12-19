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
  iconInitials?: string
  iconColorClass?: string
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

const DEFAULT_FINISH_DATE = new Date(
  Date.now() + 30 * 24 * 60 * 60 * 1000
);

export class Project implements IProject {
  //to satisfy the Iproject
  iconInitials: string
  iconColorClass: string
  name: string
  description: string
  status: "Pending" | "Active" | "Finished"
  userRole: "Architect" | "Engineer" | "Developer"
  finishDate: Date

  //Class internals
  ui: HTMLDivElement
  cost: number = 0
  progress: number = 0
  id: string

  

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
}