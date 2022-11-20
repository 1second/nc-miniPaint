import { createApp } from "vue";
import { getLocationQuery } from "./util";
import Status from "./view/Status.vue";
let onPaintInitialized = () => 0 as any;

const paintInit = new Promise<void>((r) => (onPaintInitialized = r));

// server render 模式下，不注入Nc模板参数编辑器
(window as any).onPaintInitialized =
  (window as any).onPaintInitialized || onPaintInitialized;

function paintApp(): MiniPaintApp {
  const dummy = {} as MiniPaintApp;
  const g = window as any as MiniPaintApp;
  type AppProp = keyof MiniPaintApp;
  const props: AppProp[] = [
    "onPaintInitialized",
    "onPaintChange",
    "FileOpen",
    "FileSave",
    "State",
  ];

  return new Proxy(dummy, {
    get(target, prop: AppProp) {
      if (!props.includes(prop)) return void 0;
      return g[prop];
    },
    set(target, p: AppProp, newValue, receiver) {
      console.log({ target, p, newValue, receiver });
      if (p === "onPaintChange" || p === "onPaintInitialized") {
        g[p] = newValue;
        return true;
      }
      return false;
    },
  });
}

let filename = "";
// show filename
paintInit.then(() => {
  filename = getLocationQuery().filename;
  const statusContainer = document.createElement("div");
  statusContainer.id = "nc-status";
  statusContainer.innerText = filename;
  document.querySelector("#main_menu")?.appendChild(statusContainer);
  createApp(Status, { filename, paint: paintApp() }).mount(statusContainer);
});
