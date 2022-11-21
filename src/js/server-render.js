import Base_layers from "./core/base-layers";
var tempConfig = null;

var initConfig = null;

function initLayer() {
  return {
    id: 0,
    parent_id: 0,
    name: new Date().getTime(),
    type: null,
    link: null,
    x: 0,
    y: 0,
    width: null,
    width_original: null,
    height: null,
    height_original: null,
    visible: true,
    is_vector: false,
    hide_selection_if_active: false,
    opacity: 100,
    order: 0,
    composition: "source-over",
    rotate: 0,
    data: null,
    params: {},
    status: null,
    color: "#008000",
    filters: [],
    render_function: null,
    $tplVarBindings: null,
  };
}

async function renderJson(json, canvas) {
  const config = initConfig();

  // info setting
  Object.assign(config, {
    ZOOM: 1,
    WIDTH: parseInt(json.info.width),
    HEIGHT: parseInt(json.info.height),
    user_fonts: json.user_fonts || {},
  });

  // size check
  const max = 10 * 1000 * 1000;
  if (config.WIDTH * config.WIDTH > 10 * 1000 * 1000) {
    throw new Error(
      "Size is too big, max " + this.Helper.number_format(max, 0) + " pixels."
    );
  }

  // layers
  const waitings = [];
  config.layers = json.layers.map((l) => {
    const layer = initLayer();
    for (let i in l) {
      if (typeof layer[i] == "undefined" && !i.startsWith("_")) {
        console.error("Error: wrong key: " + i);
        continue;
      }
      layer[i] = l[i];
    }

    if (layer.type === "image") {
      layer.link = null;
      for (var j in json.data) {
        if (json.data[j].id == layer.id) {
          layer.data = json.data[j].data;
        }
      }
      if (layer.name.toLowerCase().indexOf(".svg") == layer.name.length - 4) {
        // We have svg
        layer.is_vector = true;
      }
      if (typeof layer.data == "object") {
        // Load actual image
        if (layer.width == 0 || layer.width === null)
          layer.width = layer.data.width;
        if (layer.height == 0 || layer.height === null)
          layer.height = layer.data.height;
        layer.link = layer.data.cloneNode(true);
        layer.link.onload = function () {
          config.need_render = true;
        };
        layer.data = null;
      } else if (typeof layer.data == "string") {
        const image_load_promise = new Promise((resolve, reject) => {
          // Try loading as imageData
          layer.link = new Image();
          layer.link.onload = () => {
            // Update dimensions
            if (layer.width == 0 || layer.width === null)
              layer.width = layer.link.width;
            if (layer.height == 0 || layer.height === null)
              layer.height = layer.link.height;
            if (layer.width_original == null)
              layer.width_original = layer.width;
            if (layer.height_original == null)
              layer.height_original = layer.height;
            // Free data
            layer.data = null;
            config.need_render = true;
            resolve();
          };
          layer.link.onerror = (error) => {
            reject(error);
          };
          layer.link.src = layer.data;
          layer.link.crossOrigin = "Anonymous";
        });
        waitings.push(image_load_promise);
      } else {
        waitings.push(Promise.reject(new Error("Invalid layer data")));
      }
    }
    return layer;
  });

  config.layer = config.layers[0];
  // Wait for all images to load
  await Promise.all(waitings);

  // Render
  canvas = canvas || document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  canvas.width = config.WIDTH;
  canvas.height = config.HEIGHT;
  ctx.imageSmoothingEnabled = false;

  try {
    tempConfig = config;
    new Base_layers().convert_layers_to_canvas(ctx, null, false);
    return canvas;
  } finally {
    tempConfig = null;
  }
}

window.renderJson = renderJson;

export function initServerRender(config, init) {
  initConfig = init;

  return new Proxy(config, {
    get(target, prop) {
      if (tempConfig) return tempConfig[prop];
      return target[prop];
    },
    set(target, prop, value) {
      if (tempConfig) tempConfig[prop] = value;
      else target[prop] = value;
      return true;
    },
  });
}
