export class ErrorModal {
    private modal: HTMLDialogElement
    private errorText: HTMLElement
    private closeBtn: HTMLButtonElement

    constructor() {
        const existing = document.getElementById("error-modal")

        if (existing) {
            if (!(existing instanceof HTMLDialogElement)) {
                throw new Error("ErrorModal root is not a dialog")
            }
            this.modal = existing
        } else {
            const dialog = document.createElement("dialog")
            dialog.id = "error-modal"
            dialog.innerHTML = `
          <div style="
            padding: 20px;
            display: flex;
            flex-direction: column;
            row-gap: 20px;
            align-items: center;
          ">
            <span class="material-symbols-rounded"
                  style="font-size: 50px; color: red;">error</span>
  
            <p id="error-text"
               style="text-align: center; color: royalblue;">
            </p>
  
            <button id="close-error-btn"
                    style="
                      padding: 10px 20px;
                      background-color: rgb(200, 50, 50);
                      color: white;
                      border: none;
                      border-radius: 8px;
                      cursor: pointer;
                    ">
              Close
            </button>
          </div>
        `
            document.body.appendChild(dialog)
            this.modal = dialog
        }

        const errorText = this.modal.querySelector("#error-text")
        const closeBtn = this.modal.querySelector("#close-error-btn")

        if (!(errorText instanceof HTMLElement)) {
            throw new Error("Error text element missing")
        }

        if (!(closeBtn instanceof HTMLButtonElement)) {
            throw new Error("Close button missing")
        }

        this.errorText = errorText
        this.closeBtn = closeBtn

        this.closeBtn.addEventListener("click", () => {
            this.modal.close()
        })
    }

    show(message: string) {
        this.errorText.textContent = message

        if (!this.modal.open) {
            this.modal.showModal()
        }
    }
}
  