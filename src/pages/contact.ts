import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators/custom-element.js";

import Page from "../core/strategies/Page";

@customElement("ui-contact")
export class ContactController extends Page {
  public render(): void | TemplateResult {
    return html`
      <div id="page" class="page contact" role="main">
        <section class="hero">
          <h1>Contact.</h1>
        </section>

        <section class="areas">
          <p>
            <a href="mailto:leonard@uplg.xyz">leonard@uplg.xyz</a>
          </p>
        </section>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-contact": ContactController;
  }
}
