import { html, TemplateResult } from "lit";
import { customElement } from "lit/decorators/custom-element.js";
import { repeat } from "lit/directives/repeat.js";
import { map } from "lit/directives/map.js";
import { when } from "lit/directives/when.js";

import { Uplg } from "../core/uplg";

import Page from "../core/strategies/Page";
import { Pages } from "../uplg-app";
import { GithubLogo } from "../svg";

@customElement("ui-projects")
export class ProjectsController extends Page {
  private projects = [
    {
      name: "Thiweb",
      slug: "thiweb",
      description: "Community.",
      repository: "https://github.com/uplg/thiweb-crypt-n-decrypt",
      status: "published",
      url: "https://forum.thiweb.com",
      tags: ["PhpBB", "Typescript", "NodeJS", "AWS", "WebExtension"],
    },
    {
      name: "Dobrunia Design",
      slug: "dobrunia",
      description: "Custom objects & interior design.",
      status: "pause",
      repository: "https://github.com/uplg/dobrunia-design",
      url: "https://www.dobruniadesign.com",
      tags: ["Lit", "GraphQL", "Wordpress"],
    },
    {
      name: "Cheno",
      slug: "cheno",
      description: "Iron artist.",
      status: "published",
      repository: "https://github.com/uplg/cheno-website",
      url: "https://www.cheno.fr",
      tags: ["Lit", "GraphQL", "Wordpress"],
    },
    {
      name: "Backup tool",
      slug: "backup-tool",
      description: "Multi-site, simple, backup in NodeJS.",
      repository: "https://github.com/uplg/backup-tool",
      status: "published",
      url: "https://github.com/uplg/backup-tool",
      tags: ["Gzip", "MySQL", "MySQLDump", "SFTP", "FTP(ES)"],
    },
    {
      name: "Google Authenticator Export",
      slug: "ga-export",
      description:
        "Export every secret easily from Google Authenticator (Authy in another repo too.).",
      repository: "https://github.com/uplg/gauth-export",
      status: "published",
      url: "https://ga.uplg.xyz",
      tags: ["OTPAuth", "Material"],
    },
    {
      name: "Fujin",
      slug: "fujin",
      description: "Crypto / news Bot on Telegram.",
      repository: "https://github.com/uplg/fujin",
      status: "pause",
      url: "https://t.me/FujinCryptoBot",
      tags: ["NodeJS", "Telegram", "Bot", "OPML", "RSS"],
    },
    {
      name: "Persin Conseil",
      slug: "persin",
      description: "IT consulting and services.",
      repository: "https://github.com/uplg/persin-conseil",
      url: "https://www.persin.fr",
      status: "published",
      tags: ["Lit", "Offline ready", "no-js handling"],
    },
    {
      name: "BricksSDK",
      slug: "bricks-sdk",
      description: "An SDK to access Bricks.co.",
      repository: "https://github.com/uplg/bricks_sdk",
      status: "archived",
      url: "https://www.npmjs.com/package/@uplg/bricks_sdk",
      tags: ["NodeJS", "Typescript", "Zod", "Undici"],
    },
    {
      name: "MonpetitplacementSDK",
      slug: "mpp-sdk",
      description: "An SDK to access MonPetitPlacement.",
      repository: "https://github.com/uplg/monpetitplacement_sdk",
      status: "archived",
      url: "https://www.npmjs.com/package/@uplg/monpetitplacement_sdk",
      tags: ["NodeJS", "Typescript", "Zod", "Undici"],
    },
    {
      name: "PDFFormsFiller",
      slug: "pdf-forms-filler",
      description: "Fill Acrobat forms easily using pure PHP ! 💪",
      repository: "https://github.com/uplg/PDFFormsFiller",
      status: "archived",
      url: "https://github.com/uplg/PDFFormsFiller",
      tags: ["PHP", "FPDF/FPDI", "PHPUnit"],
    },
  ];

  public render(): void | TemplateResult {
    return html`
      <div id="page" class="page" role="main">
        <div class="content-section-header">
          <h1>Projects</h1>
        </div>

        <section class="projects">
          ${repeat(
            this.projects,
            (project) => project.slug,
            (project) => html`
              <div class="project">
                <a href=${project.url}>${project.name}</a>
                <div class="excerpt">
                  <p>${project.description}</p>
                  <p class="tags">
                    ${map(
                      project.tags,
                      (tag) => html`<span class="tag">${tag}</span>`
                    )}
                  </p>
                  <div class="extra">
                    ${when(
                      project.status,
                      () =>
                        html`<span class="state"
                          >${project.status.charAt(0).toUpperCase() +
                          project.status.substring(
                            1,
                            project.status.length
                          )}</span
                        >`
                    )}
                    ${when(
                      project.repository,
                      () =>
                        html`<a href="${project.repository}">${GithubLogo}</a>`
                    )}
                  </div>
                </div>
              </div>
            `
          )}
        </section>

        <a
          class="back-home flex-link justify-end"
          href="home"
          @click=${(e: Event) => Uplg()?.navigateTo(e, Pages.home)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            stroke-width="2"
            stroke-linecap="round"
            stroke-linejoin="round"
            class="feather feather-chevron-left"
          >
            <polyline points="15 18 9 12 15 6"></polyline>
          </svg>
          Home
        </a>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "ui-projects": ProjectsController;
  }
}
