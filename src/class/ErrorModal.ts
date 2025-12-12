export class ErrorModal {
    modal: HTMLDialogElement
    errorText: HTMLElement
    closeBtn: HTMLButtonElement

    constructor(dialogId: string) {
        const modalElement = document.getElementById(dialogId)
        if (!modalElement || !(modalElement instanceof HTMLDialogElement)) {
            throw new Error(`Dialog with ID "${dialogId}" not found or is not a dialog element.`)
        }