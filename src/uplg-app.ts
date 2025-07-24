import "./index.scss";

import { html, TemplateResult, render } from "lit";
import { customElement } from "lit/decorators/custom-element.js";
import { state } from "lit/decorators.js";
import { when } from "lit/directives/when.js";

import Root from "./core/strategies/Root";

import {
  bufferCount,
  defer,
  filter,
  firstValueFrom,
  from,
  fromEvent,
  map,
  mergeMap,
  sequenceEqual,
  skipWhile,
  Subscription,
  switchMap,
} from "rxjs";

import { Uplg } from "./core/uplg";
import { AchievementComponent } from "./achievement";

import { create } from "./pages/home-part";
import { GithubLogo } from "./svg";

export enum Pages {
  root = "",
  home = "home",
  wip = "wip",
  projects = "projects",
  notFound = "not-found",
  contact = "contact",
}
@customElement("uplg-app")
export class UplgApp extends Root {
  public static readonly is: string = "uplg-app";

  @state()
  public reduceAnimations = false;

  private audio: HTMLAudioElement = new Audio();

  public routing: Promise<void>;

  public randomColors!: () => void;

  private konamiSub: Subscription | null;

  private _table: { [key: string]: number } = {
    ArrowUp: 38,
    ArrowDown: 40,
    ArrowLeft: 37,
    ArrowRight: 39,
    KeyB: 66,
    KeyQ: 65,
    KeyA: 65,
  };

  public get needed(): string[] {
    return ["ui-not-found", "ui-home", "ui-projects", "ui-wip"];
  }

  constructor(path: string) {
    super();

    this.reduceAnimations = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    const art = async () => {
      const toolbox = await create();
      if (!toolbox) {
        return;
      }

      this.randomColors = () => {
        toolbox.palette.setColors();
        toolbox.palette.setCustomProperties();

        toolbox.orbs.forEach((orb) => {
          orb.fill = parseInt(toolbox.palette.randomColor(), 16);
        });
      };
    };

    const sound$ = this._loadSound();

    const knownSequence = from([38, 38, 40, 40, 37, 39, 37, 39, 66, 65]);
    const konami$ = fromEvent<KeyboardEvent>(document, "keyup").pipe(
      map((e) => (this._table[e.code] ? this._table[e.code] : -1)),
      skipWhile((k) => k !== 38),
      bufferCount(10, 1),
      mergeMap((x) => {
        return from(x).pipe(sequenceEqual(knownSequence));
      }),
      filter((sequenceEqual) => sequenceEqual),
      switchMap((_) => sound$)
    );

    this.konamiSub = konami$.subscribe();

    const pages$ = defer(() =>
      from(import(/* webpackChunkName: "pages" */ "./pages/index"))
    );

    this.routing = firstValueFrom(
      pages$.pipe(
        switchMap(async () => this.firstLoad(path)),
        switchMap(() => art())
      )
    );
  }

  public disconnectKonami() {
    this.konamiSub?.unsubscribe();
    this.konamiSub = null;
  }

  public async achievement(title: string) {
    const achievement = new AchievementComponent();
    achievement.title = title;
    this.appendChild(achievement);
    return this.success().then(() => {
      setTimeout(() => {
        this.removeChild(achievement);
      }, 300);
    });
  }

  public async success() {
    const wrapper = document.createElement("wrapper");
    wrapper.className = "particles-wrapper";

    this.querySelector(".app-container")?.appendChild(wrapper);

    for (let i = 0; i < 350; i++) {
      const div = document.createElement("div");
      div.className = "confetti-" + i;
      wrapper.appendChild(div);
    }

    wrapper.classList.add("visible");

    return new Promise((resolve) => {
      setTimeout(() => {
        wrapper.classList.remove("visible");
        wrapper.parentElement?.removeChild(wrapper);
        resolve(undefined);
      }, 3000);
    });
  }

  private async firstLoad(path: string): Promise<HTMLElement | null> {
    if (path === undefined || path === null) {
      path = Pages.root;
    }

    path = path.startsWith("/") ? path.slice(1) : path;

    switch (path) {
      case Pages.root:
      case Pages.home:
        return await this.load(Pages.home);
      case Pages.wip:
        return await this.load(Pages.wip);
      case Pages.projects:
        return await this.load(Pages.projects);
      case Pages.contact:
        return await this.load(Pages.contact);
      default:
        return await this.load(Pages.notFound);
    }
  }

  public render(): TemplateResult {
    return html` <div class="uplg">
      <div class="app-container">
        ${this.appHeader}
        <div class="app-content">
          <div class="content-section" id="content"></div>
        </div>
        <footer class="footer mimi-${this.route}">
          ${when(
            this.reduceAnimations === false,
            () => html` <span @click=${() => Uplg()?.randomColors()}>🎨</span> `
          )}
          <a href="https://status.uplg.xyz/status/uplg" target="_blank">
            Status.
          </a>
          <a target="_blank" href="https://github.com/uplg">
            ${GithubLogo}
            <span>Uplg.</span>
          </a>
        </footer>
      </div>
    </div>`;
  }

  private redirect(page: Pages, link?: HTMLElement): void {
    const links = this.querySelectorAll(".app-sidebar a");
    links.forEach((link) => link.classList.remove("active"));

    this.load(page);

    if (link) {
      link.classList.add("active");
    }
  }

  public navigateTo(e: Event | null, page: Pages): void {
    e?.preventDefault();
    this.redirect(page);
  }

  private get appHeader(): TemplateResult {
    return html` <div class="app-header">
      <div class="app-header-left">
        <p class="app-name">
          <a href="home" @click=${(e: Event) => this.navigateTo(e, Pages.home)}
            >// Uplg.</a
          >
        </p>
      </div>
    </div>`;
  }

  public showLoader(): void {
    render(
      html`<div id="loader" class="loader">
			<div id="dot"></div>
			<div class="step" id="s1"></div>
			<div class="step" id="s2"></div>
			<div class="step" id="s3"></div>
		</div>
	</div>`,
      document.body,
      { host: this }
    );
  }

  public showTime(): void {
    const loader = document.body.querySelector("#loader");
    if (!loader) {
      return;
    }

    if (!loader.parentElement) {
      return;
    }

    loader.parentElement.removeChild(loader);
  }

  private _loadSound() {
    return defer(() => {
      const assets = [
        // @ts-expect-error meh
        import(
          /* webpackChunkName: "music-opus" */ "./assets/egg/mimisiku.opus"
        ),
        // @ts-expect-error meh
        import(/* webpackChunkName: "music-ogg" */ "./assets/egg/mimisiku.ogg"),
        // @ts-expect-error meh
        import(/* webpackChunkName: "music-mp3" */ "./assets/egg/mimisiku.mp3"),
      ];

      return from(Promise.all(assets)).pipe(
        switchMap(async (media) => {
          if (!this.audio.paused) {
            return;
          }

          function createSource(type: string) {
            const source = document.createElement("source");
            source.id = type;
            let src: string | null = null;

            switch (type) {
              case "opus":
                source.type = "audio/ogg; codecs=opus";
                src = media[0].default;
                break;
              case "ogg":
                source.type = "audio/ogg; codecs=vorbis";
                src = media[1].default;
                break;
              case "mp3":
                source.type = "audio/mpeg";
                src = media[2].default;
                break;
            }

            if (src) {
              source.src = src;
            }

            return source;
          }

          this.audio.appendChild(createSource("opus"));
          this.audio.appendChild(createSource("ogg"));
          this.audio.appendChild(createSource("mp3"));

          this.appendChild(this.audio);

          this.audio.load();

          return await Promise.all([
            this.achievement("konami"),
            this.audio.play(),
          ]).then(() => {
            this.disconnectKonami();
            setTimeout(() => {
              this.audio.parentElement?.removeChild(this.audio);
            }, this.audio.duration * 1000);
          });
        })
      );
    });
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "uplg-app": UplgApp;
  }
}
