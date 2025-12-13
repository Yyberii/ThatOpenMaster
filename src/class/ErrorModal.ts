export class ErrorModal {
    private modal: HTMLDialogElement
    private errorText: HTMLElement
    private closeBtn: HTMLButtonElement

    //for error modal dialog

    constructor(dialogId: string) {
        const dialog = document.getElementById(dialogId)

        if (!(dialog instanceof HTMLDialogElement)) {
            throw new Error(`Element with ID "${dialogId}" is not a dialog element.`)
        }

        this.modal = dialog

        const errorText = dialog.querySelector("#error-text")
        const closeBtn = dialog.querySelector("#close-error-btn")

        if (!(errorText instanceof HTMLElement)) {
            throw new Error("Error text element not found in the dialog.")
        }

        if (!(closeBtn instanceof HTMLButtonElement)) {
            throw new Error("Close button not found in the dialog.")
        }

        this.errorText = errorText
        this.closeBtn = closeBtn

        this.closeBtn.addEventListener("click", () => {
            this.modal.close()
        })
    }

    show(message: string) {
        this.errorText.textContent = message
        this.modal.showModal()
    }
}
  