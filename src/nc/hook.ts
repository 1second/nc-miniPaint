import { api } from "./api/api";
import { getLocationQuery } from "./util";
let onPaintInitialized = () => 0 as any;

const paintInit = new Promise<void>((r) => (onPaintInitialized = r));

(window as any).onPaintInitialized =
  (window as any).onPaintInitialized || onPaintInitialized;

let filename = "";
// show filename
paintInit.then(() => {
  filename = getLocationQuery().filename;
  const filenameContainer = document.createElement("div");
  filenameContainer.id = "filename-container";
  filenameContainer.innerText = filename;
  document.querySelector("#main_menu")?.appendChild(filenameContainer);
});

// load file
const getTemplatePromise = paintInit.then(() => api.getTemplate(filename));

declare var Layers: any;
declare var FileOpen: any;
declare var FileSave: any;
declare var State: any;

// open file
const openPromise = getTemplatePromise.then((tpl) =>
  FileOpen.load_json(tpl, false)
);

openPromise.catch((e) => {
  alert("Failed to load template: " + e.toString());
  console.error(e);
});

function onPaintChange() {
  console.log('change');
}

openPromise.then(() => {
  (window as any).onPaintChange = onPaintChange;
})

// save file periodically
openPromise.then(() => {
  State.reset();
  let last = FileSave.export_as_json();
  setInterval(() => {
    const current = FileSave.export_as_json();
    if (current !== last) {
      api.saveTemplate(filename, JSON.parse(current)).catch((e) => {
        alert("Failed to save template: " + e.toString());
        console.error(e);
      });
    } else {
      console.log("no change");
    }
  }, 10e3);
});
