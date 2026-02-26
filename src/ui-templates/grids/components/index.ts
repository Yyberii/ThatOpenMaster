import * as BUI from "@thatopen/ui";
import { ComponentsGrid } from "./src";
import { viewportContainerTemplate } from "../../containers";
import { itemsDataPanelTemplate, modelsPanelTemplate, queriesPanelTemplate } from "../../sections";
import * as OBC from "@thatopen/components"
import { appIcons } from "../../../globals";

interface ComponentsGridState {
  components: OBC.Components
  viewport?: BUI.Viewport
}

export const componentsGridTemplate: BUI.StatefullComponent<ComponentsGridState> = (state) => {
  const { components, viewport } = state
  const onCreated = (e?: Element) => {
    if (!e) return;
    const grid = e as ComponentsGrid;

    grid.elements = {
      viewport: {
        template: viewportContainerTemplate,
        initialState: { viewport },
      },
      itemsData: {
        template: itemsDataPanelTemplate,
        initialState: { components }
      },
      models: {
        template: modelsPanelTemplate,
        initialState: { components }
      },
      queries: {
        template: queriesPanelTemplate,
        initialState: { components }
      },
    };

    grid.layouts = {
      Models: {
        icon: appIcons.MODELS,
        template: `
          "models viewport itemsData" 1fr
          "queries viewport itemsData" 1fr
          /22rem 1fr 22rem
        `,
      },
      Queries: {
        icon: appIcons.QUERIES,
        template: `
          "viewport queries" 1fr
          /1fr 22rem
        `,
      },
      Viewer: {
        icon: appIcons.VIEWER,
        template: `
          "viewport" 1fr
          /1fr
        `,
      },
    };

    grid.layout = "Models"
  }
  return BUI.html`<bim-grid ${BUI.ref(onCreated)} class="components-grid"></bim-grid>`
}