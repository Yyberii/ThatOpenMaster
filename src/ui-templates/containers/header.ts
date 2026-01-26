import * as BUI from "@thatopen/ui";

export interface HeaderContainerState {
  header?: BUI.Viewport;
}

export const headerContainerTemplate: BUI.StatefullComponent<HeaderContainerState> = (state) => {
  return BUI.html`
    <bim-label class="header-container">
      <div class="header-logo">Logo</div>
    </bim-label>
  `;
};