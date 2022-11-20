/// <reference types="vite/client" />
/// <reference types="./nc/mini-paint" />

interface Trackable<T> {
  readonly value: T;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<{}, {}, any>;
  export default component;
  const a: MiniPaintApp;
}

interface ImportMetaEnv {}
