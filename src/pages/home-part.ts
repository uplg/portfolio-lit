import { Application, Graphics } from "pixi.js";
import { KawaseBlurFilter } from "pixi-filters";
import { createNoise2D } from "simplex-noise";
import hsl from "hsl-to-hex";

import { Uplg } from "../core/uplg";

import { debounceTime, fromEvent, tap } from "rxjs";

function random(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function map(
  n: number,
  start1: number,
  end1: number,
  start2: number,
  end2: number
) {
  return ((n - start1) / (end1 - start1)) * (end2 - start2) + start2;
}

const noise2D = createNoise2D();

export class ColorPalette {
  private hue: number | null = null;
  private complimentaryHue1: number | null = null;
  private complimentaryHue2: number | null = null;
  private saturation: number | null = null;
  private lightness: number | null = null;
  private baseColor: string | null = null;
  private complimentaryColor1: string | null = null;
  private complimentaryColor2: string | null = null;
  private colorChoices: string[] = [];

  constructor() {
    this.setColors();
    this.setCustomProperties();
  }

  setColors() {
    this.hue = ~~random(220, 360);
    this.complimentaryHue1 = this.hue + 30;
    this.complimentaryHue2 = this.hue + 60;
    this.saturation = 95;
    this.lightness = 50;

    this.baseColor = hsl(this.hue, this.saturation, this.lightness);
    this.complimentaryColor1 = hsl(
      this.complimentaryHue1,
      this.saturation,
      this.lightness
    );
    this.complimentaryColor2 = hsl(
      this.complimentaryHue2,
      this.saturation,
      this.lightness
    );

    this.colorChoices = [
      this.baseColor,
      this.complimentaryColor1,
      this.complimentaryColor2,
    ];
  }

  randomColor() {
    return this.colorChoices[~~random(0, this.colorChoices.length)].replace(
      "#",
      "0x"
    );
  }

  setCustomProperties() {
    document.documentElement.style.setProperty("--hue", `${this.hue}`);
    document.documentElement.style.setProperty(
      "--hue-complimentary1",
      `${this.complimentaryHue1}`
    );
    document.documentElement.style.setProperty(
      "--hue-complimentary2",
      `${this.complimentaryHue2}`
    );
  }
}

export class Orb {
  private bounds: {
    x: { min: number; max: number };
    y: { min: number; max: number };
  };
  private x: number;
  private y: number;
  private scale: number;
  private radius: number;
  private xOff: number;
  private yOff: number;
  private inc: number;

  public graphics: Graphics;
  public fill: number;

  constructor(fill = 0x000000) {
    this.bounds = this.setBounds();
    this.x = random(this.bounds["x"].min, this.bounds["x"].max);
    this.y = random(this.bounds["y"].min, this.bounds["y"].max);

    this.scale = 1;
    this.fill = fill;
    this.radius = random(window.innerHeight / 6, window.innerHeight / 3);

    this.xOff = random(0, 1000);
    this.yOff = random(0, 1000);
    this.inc = 0.002;

    this.graphics = new Graphics();
    this.graphics.alpha = 0.825;

    fromEvent(window, "resize")
      .pipe(
        debounceTime(250),
        tap(() => {
          this.bounds = this.setBounds();
        })
      )
      .subscribe();
  }

  setBounds() {
    // how far from the { x, y } origin can each orb move
    const maxDist =
      window.innerWidth < 1000 ? window.innerWidth / 3 : window.innerWidth / 5;
    // the { x, y } origin for each orb (the bottom right of the screen)
    const originX = window.innerWidth / 1.25;
    const originY =
      window.innerWidth < 1000
        ? window.innerHeight
        : window.innerHeight / 1.375;

    return {
      x: {
        min: originX - maxDist,
        max: originX + maxDist,
      },
      y: {
        min: originY - maxDist,
        max: originY + maxDist,
      },
    };
  }

  update() {
    // self similar "psuedo-random" or noise values at a given point in "time"
    const xNoise = noise2D(this.xOff, this.yOff);
    const yNoise = noise2D(this.yOff, this.yOff);
    const scaleNoise = noise2D(this.xOff, this.yOff);

    // map the xNoise/yNoise values (between -1 and 1) to a point within the orb's bounds
    this.x = map(xNoise, -1, 1, this.bounds["x"].min, this.bounds["x"].max);
    this.y = map(yNoise, -1, 1, this.bounds["y"].min, this.bounds["y"].max);
    // map scaleNoise (between -1 and 1) to a scale value somewhere between half of the orb's original size, and 100% of it's original size
    this.scale = map(scaleNoise, -1, 1, 0.5, 1);

    // step through "time"
    this.xOff += this.inc;
    this.yOff += this.inc;
  }

  render() {
    this.graphics.x = this.x;
    this.graphics.y = this.y;
    this.graphics.scale.set(this.scale);

    this.graphics.clear();
    this.graphics.circle(0, 0, this.radius);
    this.graphics.fill(this.fill);
  }
}

export async function create(): Promise<{
  app: Application;
  palette: ColorPalette;
  orbs: Orb[];
} | null> {
  const canvas = document.querySelector<HTMLCanvasElement>(
    "canvas.background-canvas"
  );
  if (!canvas) {
    return null;
  }

  const app = new Application();
  await app.init({
    canvas: canvas,
    resizeTo: window,
    backgroundAlpha: 0.3,
  });

  const colorPalette = new ColorPalette();
  app.stage.filters = [
    new KawaseBlurFilter({
      strength: 30,
      quality: 10,
      clamp: true,
    }),
  ];

  const orbs: Orb[] = [];

  for (let i = 0; i < 10; i++) {
    const orb = new Orb(parseInt(colorPalette.randomColor(), 16));
    app.stage.addChild(orb.graphics);
    orbs.push(orb);
  }

  if (Uplg()?.reduceAnimations === false) {
    app.ticker.add(() => {
      orbs.forEach((orb) => {
        orb.update();
        orb.render();
      });
    });
  } else {
    orbs.forEach((orb) => {
      orb.update();
      orb.render();
    });
    app.render();
    app.stop();
  }

  return {
    app,
    palette: colorPalette,
    orbs,
  };
}
