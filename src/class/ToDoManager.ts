import { Project, getColorClassFromText } from "./Project"

export class ToDoManager {
  constructor(private project: Project) {}

  render(showForm: boolean = false) {
    // Find the to-do items container
    const todoItemsContainer = document.querySelector('[style*="flex-direction: column; padding: 10px 30px"]') as HTMLElement | null
    if (!todoItemsContainer) { return }

    // Clear existing items
    todoItemsContainer.innerHTML = ''

    // Add inline form only if showForm is true
    if (showForm) {
      const formDiv = document.createElement('div')
      formDiv.style.cssText = 'display: flex; gap: 8px; padding: 10px 0; align-items: center; width: 100%; box-sizing: border-box; flex-wrap: wrap;'
      formDiv.innerHTML = `
        <input type="text" id="todo-title-input" placeholder="What needs to be done?" style="flex: 1; min-width: 180px; padding: 6px; border-radius: 5px; border: 1px solid #404040; background: #2a2a2a; color: white; font-size: 14px;">
        <input type="date" id="todo-date-input" style="padding: 6px; border-radius: 5px; border: 1px solid #404040; background: #2a2a2a; color: white; font-size: 14px;">
        <select id="todo-status-input" style="padding: 6px; border-radius: 5px; border: 1px solid #404040; background: #2a2a2a; color: white; font-size: 14px;">
          <option value="Pending">Pending</option>
          <option value="Active">Active</option>
          <option value="Finished">Finished</option>
        </select>
        <button id="todo-submit-btn" style="padding: 6px 12px; background-color: rgb(18, 145, 18); border-radius: 5px; border: none; color: white; cursor: pointer; font-size: 14px;">Add</button>
        <button id="todo-cancel-btn" style="padding: 6px 12px; background-color: transparent; border: 1px solid #404040; border-radius: 5px; color: white; cursor: pointer; font-size: 14px;">Cancel</button>
      `
      
      todoItemsContainer.appendChild(formDiv)

      // Get form elements
      const submitBtn = formDiv.querySelector('#todo-submit-btn') as HTMLButtonElement
      const cancelBtn = formDiv.querySelector('#todo-cancel-btn') as HTMLButtonElement
      const titleInput = formDiv.querySelector('#todo-title-input') as HTMLInputElement
      const dateInput = formDiv.querySelector('#todo-date-input') as HTMLInputElement
      const statusInput = formDiv.querySelector('#todo-status-input') as HTMLSelectElement

      // Submit handler
      submitBtn.addEventListener('click', () => {
        const title = titleInput.value.trim()
        const date = dateInput.value
        const status = statusInput.value as any
        
        if (!title) {
          console.warn('To-Do title cannot be empty')
          return
        }
        if (!date) {
          console.warn('To-Do date is required')
          return
        }

        this.project.addToDo(title, new Date(date), status)
        this.render(false) // Hide form after adding
      })

      // Cancel handler
      cancelBtn.addEventListener('click', () => {
        this.render(false) // Hide form when cancelled
      })
    }

    // Render existing to-dos
    for (const todo of this.project.todos) {
      const todoDiv = document.createElement('div')
      todoDiv.className = 'todo-item'
      const dueDate = new Date(todo.dueDate)
      const formattedDate = dueDate.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })
      const colorClass = getColorClassFromText(todo.title)
      
      // Add status-based class
      if (todo.status === 'Pending') todoDiv.classList.add('todo-item-pending')
      if (todo.status === 'Active') todoDiv.classList.add('todo-item-active')
      if (todo.status === 'Finished') todoDiv.classList.add('todo-item-finished')
      
      todoDiv.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <div style="display: flex; column-gap: 15px; align-items: center;">
            <span class="material-symbols-rounded ${colorClass}" style="padding: 10px; border-radius: 10px; cursor: pointer;">construction</span>
            <div style="display: flex; flex-direction: column;">
              <p style="${todo.completed ? 'text-decoration: line-through; color: #808080;' : ''}">${todo.title}</p>
              <select class="todo-status-select" data-todo-id="${todo.id}" style="padding: 4px; border-radius: 5px; border: 1px solid #404040; background: #2a2a2a; color: white; font-size: 12px;">
                <option value="Pending" ${todo.status === 'Pending' ? 'selected' : ''}>Pending</option>
                <option value="Active" ${todo.status === 'Active' ? 'selected' : ''}>Active</option>
                <option value="Finished" ${todo.status === 'Finished' ? 'selected' : ''}>Finished</option>
              </select>
            </div>
          </div>
          <p style="text-wrap: nowrap; margin-left: 10px;">${formattedDate}</p>
        </div>
      `

      const icon = todoDiv.querySelector('.material-symbols-rounded') as HTMLElement
      icon.addEventListener('click', () => {
        this.project.toggleToDo(todo.id)
        this.render(false)
      })

      const statusSelect = todoDiv.querySelector('.todo-status-select') as HTMLSelectElement
      statusSelect.addEventListener('change', () => {
        this.project.updateToDoStatus(todo.id, statusSelect.value as any)
        this.render(false)
      })

      todoItemsContainer.appendChild(todoDiv)
    }
  }
}
