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


type IfEquals<X, Y, A, B> =
    (<T>() => T extends X ? 1 : 2) extends
    (<T>() => T extends Y ? 1 : 2) ? A : B;

// Alternatively:
/*
type IfEquals<X, Y, A, B> =
    [2] & [0, 1, X] extends [2] & [0, 1, Y] & [0, infer W, unknown]
    ? W extends 1 ? B : A
    : B;
*/

type WritableKeysOf<T> = {
    [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, P, never>
}[keyof T];

type WritablePart<T> = Pick<T, WritableKeysOf<T>>;

type ReadonlyKeysOf<T> = {
    [P in keyof T]: IfEquals<{ [Q in P]: T[P] }, { -readonly [Q in P]: T[P] }, never, P>
}[keyof T];
type ReadonlyPart<T> = Pick<T, ReadonlyKeysOf<T>>;
