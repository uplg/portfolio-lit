import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators/custom-element.js";
import { Uplg } from "../core/uplg";

import Page from "../core/strategies/Page";
import { Pages } from "../uplg-app";
import { Chevron } from "../svg";

@customElement("ui-home")
export class HomeController extends Page {
  public render(): void | TemplateResult {
    return html`
      <div id="page" class="page home" role="main">
        <section class="hero">
          <h1>
            Passionately building and creating, bringing the future to the
            present.
          </h1>
        </section>

        <section class="areas">
          <section class="service">
            <h2>Development</h2>
            <p>
              We utilise insights and expertise gained from managing multiple
              successful projects.
            </p>
            <ul>
              <li>Custom solutions using state of the art technologies</li>
              <li>Decentralization (DLT)</li>
              <li>Tracking solutions</li>
              <li>OpenID</li>
              <li>IoT</li>
            </ul>
            <a
              href="projects"
              @click=${(e: Event) => Uplg()?.navigateTo(e, Pages.projects)}
            >
              Projects ${Chevron}
            </a>
          </section>

          <section class="service">
            <h2>Networking</h2>
            <p>
              We have enabled the growth of large successful communities,
              deploying infrastructure at scale.
            </p>
            <ul>
              <li>On-premise private networks</li>
              <li>Self-sovereign identities</li>
              <li>Offshore hosting</li>
              <li>Monitoring</li>
              <li>Security</li>
            </ul>
            <a
              class="wip"
              href="wip"
              @click=${(e: Event) => Uplg()?.navigateTo(e, Pages.wip)}
            >
              Cases ${Chevron}
            </a>
          </section>
        </section>

        <div class="links">
          <a
            href="contact"
            @click=${(e: Event) => Uplg()?.navigateTo(e, Pages.contact)}
          >
            // Contact.
          </a>
        </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-home": HomeController;
  }
}
