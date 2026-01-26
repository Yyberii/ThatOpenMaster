import * as BUI from "@thatopen/ui";

export interface SidebarContainerState {
  sidebar?: BUI.Viewport;
}

export const sidebarContainerTemplate: BUI.StatefullComponent<SidebarContainerState> = (state) => {
  return BUI.html`
    <bim-label class="sidebar-container">
      <nav class="sidebar-menu">Menu</nav>
    </bim-label>
  `;
};