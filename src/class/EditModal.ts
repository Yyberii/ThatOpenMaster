import { IProject, Project, ProjectStatus, UserRole } from "./Project"

export class EditModal {
  private modal: HTMLDialogElement
  private editModalContent: HTMLElement
  private closeBtn: HTMLButtonElement
  private onSave?: (data: any) => void

//* ONLY FOR USER INTERFACE AND DISPLAYING DATA

  constructor(onSave?: (data: any) => void) {
    this.onSave = onSave
    const existing = document.getElementById("edit-modal")

    if (existing) {
      if (!(existing instanceof HTMLDialogElement)) {
        throw new Error("ErrorModal root is not a dialog")
      }
      this.modal = existing
    } else {
      const dialog = document.createElement("dialog")
      dialog.id = "edit-modal"
      dialog.innerHTML = `
        <form id="edit-modal-content">
          <div style="padding: 0 30px;">
            <div class="form-field-container">
              <label>Name</label>
              <input type="text" id="edit-name" name="name">
              <textarea id="edit-description" name="description" cols="30" rows="4" style="margin-top: 10px;">
              </textarea>
            </div>
            <div style="display: flex; flex-wrap: wrap; column-gap: 30px; row-gap: 20px; padding: 30px 0px; justify-content: space-between;">
              <div style="flex: 1; min-width: 150px;">
                <p style="color: #969696; font-size: var(--font-sm)">Status</p>
                <select id="edit-status" name="status" style="width: 100%;">
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Finished">Finished</option>
                </select>
              </div>
              <div style="flex: 1; min-width: 150px;">
                <p style="color: #969696; font-size: var(--font-sm)">Cost</p>
                <input type="text" id="edit-cost" name="cost" value="$ 2 542.000" style="width: 100%; box-sizing: border-box;">
              </div>
              <div style="flex: 1; min-width: 150px;">
                <p style="color: #969696; font-size: var(--font-sm)">Role</p>
                <select id="edit-role" name="role" style="width: 100%;">
                  <option value="Architect">Architect</option>
                  <option value="Engineer">Engineer</option>
                  <option value="Developer">Developer</option>
                </select>
              </div>
              <div style="flex: 1; min-width: 150px;">
                <p style="color: #969696; font-size: var(--font-sm)">Finish Date</p>
                <input type="date" id="edit-finishDate" name="finishDate" style="width: 100%; box-sizing: border-box;">
              </div>
            </div>
            <div>
              <p style="color: #969696; font-size: var(--font-sm)">Progress</p>
              <div style="display: flex; align-items: center; column-gap: 15px; margin-top: 10px;">
                <input type="number" id="edit-progress" name="progress" min="0" max="100" style="width: 60px; padding: 5px; text-align: center;">
                <div style="flex: 1; background-color: #404040; border-radius: 100px; overflow: auto; height: 20px;">
                  <div id="progress-bar" style="width: 80%; height: 100%; background-color: green;">
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 20px 30px;">
            <button type="button" id="close-edit-btn" style="padding: 10px 20px; background-color: rgb(200, 50, 50); color: white; border: none; border-radius: 8px; cursor: pointer;">
              Close
            </button>
            <button type="button" id="save-edit-btn" style="padding: 10px 20px; background-color: rgba(50, 200, 95, 1); color: white; border: none; border-radius: 8px; cursor: pointer;">
              Save
            </button>
          </div>
        </form>
      `
      document.body.appendChild(dialog)
      this.modal = dialog
    }

    const editModalContent = this.modal.querySelector("#edit-modal-content")

    const closeBtn = this.modal.querySelector("#close-edit-btn")
    if (!(editModalContent instanceof HTMLElement)) {
      throw new Error("Edit modal content element missing")
    }
    if (!(closeBtn instanceof HTMLButtonElement)) {
      throw new Error("Close button missing")
    }

    this.editModalContent = editModalContent
    this.closeBtn = closeBtn

    this.closeBtn.addEventListener("click", () => {
      this.modal.close()
    })

    const saveBtn = this.modal.querySelector("#save-edit-btn") as HTMLButtonElement | null
    if (saveBtn) {
      saveBtn.addEventListener("click", () => {
        if (this.onSave) {
          const formData = {
            name: (this.modal.querySelector("#edit-name") as HTMLInputElement)?.value,
            description: (this.modal.querySelector("#edit-description") as HTMLTextAreaElement)?.value,
            status: (this.modal.querySelector("#edit-status") as HTMLSelectElement)?.value,
            cost: (this.modal.querySelector("#edit-cost") as HTMLInputElement)?.value,
            userRole: (this.modal.querySelector("#edit-role") as HTMLSelectElement)?.value,
            finishDate: (this.modal.querySelector("#edit-finishDate") as HTMLInputElement)?.value,
            progress: (this.modal.querySelector("#edit-progress") as HTMLInputElement)?.value,
          }
          this.onSave(formData)
          this.modal.close()
        }
      })
    }
  }

  show(project: Project) {
    const nameInput = this.modal.querySelector("#edit-name") as HTMLInputElement | null;
    const descInput = this.modal.querySelector("#edit-description") as HTMLTextAreaElement | null;
    const statusSelect = this.modal.querySelector("#edit-status") as HTMLSelectElement | null;
    const costInput = this.modal.querySelector("#edit-cost") as HTMLInputElement | null;
    const roleSelect = this.modal.querySelector("#edit-role") as HTMLSelectElement | null;
    const finishDateInput = this.modal.querySelector("#edit-finishDate") as HTMLInputElement | null;
    const progressInput = this.modal.querySelector("#edit-progress") as HTMLInputElement | null;
    const progressBar = this.modal.querySelector("#progress-bar") as HTMLElement | null;

    if (nameInput) {
      nameInput.value = project.name
    }
    if (descInput) {
      descInput.value = project.description
    }
    if (statusSelect) {
      statusSelect.value = project.status
    }
    if (costInput) {
      costInput.value = project.cost.toString()
    }
    if (roleSelect) {
      roleSelect.value = project.userRole
    }
    if (finishDateInput) {
      finishDateInput.value = project.finishDate.toISOString().split('T')[0]
    }
    if (progressInput) {
      progressInput.value = project.progress.toString()
      progressInput.addEventListener("input", () => {
        if (progressBar) {
          progressBar.style.width = `${progressInput.value}%`
        }
      })
    }
    if (progressBar) {
      progressBar.style.width = `${project.progress}%`
    }
    if (!this.modal.open) {
      this.modal.showModal()
    }
  }
}  

/* const editModal = document.getElementById("edit-modal")
if (editModal) { editModal.addEventListener("submit", (e) => {
    e.preventDefault()
    const modalData = new FormData(editModal)
else {
  console.warn("Edit modal not found")
}

const myProject = new Project(formData.get("name"))

*/