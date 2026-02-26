import * as BUI from "@thatopen/ui";

export interface SidebarContainerState {
  viewport?: BUI.Viewport;
}

export const sidebarContainerTemplate: BUI.StatefullComponent<SidebarContainerState> = (state) => {
  let content: HTMLElement | undefined = state.viewport;
  if (!content) {
    content = BUI.Component.create(() => BUI.html`
        <bim-label>No sidebar has been defined.</bim-label>
      `,)
  }
  return BUI.html`<div class="viewport-container">${content}</div>`;
};