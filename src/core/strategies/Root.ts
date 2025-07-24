import { LitElement } from "lit";
import { property, query } from "lit/decorators.js";
import { Pages } from "../../uplg-app";

/**
 * Abtract <*-app> component strategy
 *
 * @export
 * @abstract
 * @class Root
 * @extends {LitElement}
 */
export default abstract class Root extends LitElement {
  @property({ reflect: true, type: String })
  public route!: string | null;

  @query("#content")
  protected _content!: HTMLDivElement;

  /**
   * Inside JS dark-mode handling
   *
   * @private
   * @memberof Root
   */
  private _queries = {
    DARK: "(prefers-color-scheme: dark)",
    LIGHT: "(prefers-color-scheme: light)",
  };

  // Global loader control
  // Needed for "progressive" app load
  public abstract get needed(): string[];

  // Render in <app> light-dom
  protected createRenderRoot(): this {
    return this;
  }

  public connectedCallback(): void {
    super.connectedCallback();

    const darkQuery = window.matchMedia(this._queries.DARK);
    const lightQuery = window.matchMedia(this._queries.LIGHT);
    if (darkQuery.matches) {
      document.documentElement.classList.add("night");
    }
    if (lightQuery.matches) {
      document.documentElement.classList.add("day");
    }
  }

  public async load(route: string | null): Promise<HTMLElement | null> {
    route = route ?? Pages.home;

    history.pushState(null, "", route);
    this.route = route;

    const defaultTitle = "Uplg.";
    const componentName = "ui-" + route;

    const hasComponent = customElements.get(componentName);
    const Component = hasComponent ?? customElements.get("ui-not-found");

    let loaded: HTMLElement | null = null;
    if (Component) {
      loaded = new Component();
    }

    document.title = defaultTitle;

    window.scrollTo(0, 0);

    if (!loaded) {
      return null;
    }

    while (this._content.lastChild) {
      this._content.removeChild(this._content.lastChild);
    }

    this._content.appendChild(loaded);

    return loaded;
  }
}
