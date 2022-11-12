import "./env";
import "./env2";
import { describe, expect, it } from "vitest";
import File_save_class from "../src/js/modules/file/save.js";
import Base_layers_class from "../src/js/core/base-layers";
import File_new_class from "../src/js/modules/file/new";
import File_open_class from "../src/js/modules/file/open";
import config from "../src/js/config";
import { document } from "./env";
import imageJson from "./image1";
import { init } from "../src/js/main";
import fs from "fs";
import { time } from "console";
const baseLayer = new Base_layers_class();
const fileSave = new File_new_class();
const fileOpen = new File_open_class();

describe("Image.prototype.src", () => {
  it("triggers load for valid data URL", async () => {
    // A 1x1 pixel, base64-encoded PNG with a white background
    const pngPixel =
      "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=";

    async function loadImage(src: string) {
      return new Promise((resolve, reject) => {
        const image = new Image();

        image.onload = (event) => resolve(true);
        image.onerror = (error) => reject(error);
        image.src = src;
        document.body.appendChild(image);
      });
    }

    const result = await loadImage(pngPixel);
    expect(result).toEqual(true);
  });
});

describe("should", () => {
  it("exported", () => {
    expect(1).toEqual(1);
  });
});

function render() {
  var max = 10 * 1000 * 1000;
  if (config.WIDTH * config.WIDTH > 10 * 1000 * 1000) {
    throw new Error(`Size is too big`);
    return;
  }

  var canvas = document.createElement("canvas") as HTMLCanvasElement;
  var ctx = canvas.getContext("2d")!;
  canvas.width = config.WIDTH;
  canvas.height = config.HEIGHT;

  //   ctx.webkitImageSmoothingEnabled = false;
  //   ctx.oImageSmoothingEnabled = false;
  //   ctx.msImageSmoothingEnabled = false;
  ctx.imageSmoothingEnabled = false;

  //ask data
  baseLayer.convert_layers_to_canvas(ctx, null, false);
  var data_url = canvas.toDataURL();
  fs.writeFileSync("test.png", data_url.replace(/^data:image\/png;base64,/, ""), "base64");
  return data_url;
}

init();

describe("render", () => {
  it("to-png", async () => {
    await fileOpen.load_json(imageJson);
    console.log("config layer cnt ", config.layers.length);
    const result = render();
    console.log("to png", result?.length);
    await new Promise((resolve) => setTimeout(resolve, 60e3));
  });
}, 60e3);
