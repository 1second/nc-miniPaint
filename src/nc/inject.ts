import { createApp, markRaw } from "vue";
import { getLocationQuery } from "./util";
import Status from "./view/Status.vue";
import { ncConfigWithVar } from "./tplVar";
import { DummyAction } from "./actions/dummy";
import {  hookJsonImportExport } from "./hook";
let onPaintInitialized = () => 0 as any;

const paintInit = new Promise<void>((r) => (onPaintInitialized = r));

// server render 模式下，不注入Nc模板参数编辑器
(window as any).onPaintInitialized =
  (window as any).onPaintInitialized || onPaintInitialized;

(window as any).ncConfigWithVar = ncConfigWithVar;

function paintApp(): MiniPaintApp {
  const dummy = {} as MiniPaintApp;
  const g = window as any as MiniPaintApp;
  type AppProp = keyof MiniPaintApp;
  const props: ReadonlyKeysOf<MiniPaintApp>[] = [
    "FileOpen",
    "FileSave",
    "State",
    "AppConfig",
  ];
  const hooks: WritableKeysOf<MiniPaintApp>[] = [
    "onPaintInitialized",
    "onPaintChange",
    "ncPreLoadJson",
    "ncPostExportJson",
    "doDummyAction",
  ];

  markRaw(g.AppConfig);

  const doDummyAction = async (desc: string) => {
    g.State.do_action(new DummyAction(desc));
  };

  return new Proxy(dummy, {
    get(target, prop: AppProp) {
      if (prop === "doDummyAction") return doDummyAction;
      if (!props.includes(prop as any) && !hooks.includes(prop as any))
        return void 0;
      return g[prop];
    },
    set(target, p: WritableKeysOf<MiniPaintApp>, newValue, receiver) {
      if (hooks.includes(p)) {
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
  const paint = paintApp();
  hookJsonImportExport(paint);
  filename = getLocationQuery().filename;
  const statusContainer = document.createElement("div");
  statusContainer.id = "nc-status";
  statusContainer.innerText = filename;
  document.querySelector("#main_menu")?.appendChild(statusContainer);
  createApp(Status, { filename, paint }).mount(statusContainer);
});
