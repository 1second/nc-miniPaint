import { Options, compileExpression } from "filtrex";
import { deepCopy } from "./util";

type TplVarTypeMap = {
  string: string;
  number: number;
  boolean: boolean;
  image: HTMLImageElement;
  object: any;
};

type TplVarT<Type extends keyof TplVarTypeMap> = {
  name: string;
  type: Type;
  value: TplVarTypeMap[Type];
  expression?: string;
  editLock?: boolean;
  data?: any;
};

type StringTplVar = TplVarT<"string">;
type NumberTplVar = TplVarT<"number">;
type BooleanTplVar = TplVarT<"boolean">;
type ImageTplVar = TplVarT<"image">;
type ObjectTplVar = TplVarT<"object">;

export type TplVar =
  | StringTplVar
  | NumberTplVar
  | BooleanTplVar
  | ImageTplVar
  | ObjectTplVar;

export interface BindInfo {
  varName: string;
  originalValue: any;
}

export interface HasBindingObj {
  [key: string]: any;
  $tplVarBindings: Record<string, BindInfo>;
}

export const compileExprOptions: Options = {
  extraFunctions: {
    now: () => new Date().toLocaleString(),
  },
};

let imageHttpDownload = async (url: string) => {
  return url;
};

export const setImageHttpDownload = (fn: typeof imageHttpDownload) => {
  imageHttpDownload = fn;
};

export async function evalMiniPaintJson(
  json: HasBindingObj,
  dataOverride: Record<string, any> = {}
) {
  const varMap: Record<string, any> = {};
  const imageVars = new Set<string>();

  const vars = json._tplVars as TplVar[];
  if (!vars) return json;

  // 1. collect all variables that is not expression
  for (const v of vars) {
    if (v.expression) continue;
    if (v.type === "image") {
      varMap[v.name] = v.data;
      imageVars.add(v.name);
    } else {
      varMap[v.name] = v.value;
    }
  }

  // 2. set override data
  const imageDownloads: Promise<any>[] = [];
  for (const [k, v] of Object.entries(dataOverride)) {
    // only exist variable can be override
    if (!varMap.hasOwnProperty(k)) continue;

    // image http link need to convert to data url
    if (!imageVars.has(k)) {
      varMap[k] = v;
      continue;
    }
    imageDownloads.push(
      imageHttpDownload(v).then((data) => (varMap[k] = data))
    );
  }

  await Promise.all(imageDownloads);

  // 3. eval expression
  const evalEnvVar = Object.fromEntries(
    Object.entries(varMap).filter(([k]) => !imageVars.has(k))
  );
  for (const v of vars) {
    if (!v.expression) continue;
    try {
      const fn = compileExpression(v.expression, compileExprOptions);
      const result = fn(evalEnvVar);
      if (result instanceof Error) throw result;
      varMap[v.name] = result;
    } catch (e) {
      console.warn(`Failed to eval expression for ${v.name}: ${v.expression}`);
      console.warn(e);
    }
  }

  // 4. traverse json and replace variable
  const walk = (obj: any) => {
    // walk array
    if (Array.isArray(obj)) {
      for (const item of obj) {
        walk(item);
      }
      return;
    }
    // skip non object
    if (typeof obj !== "object") return;
    if (!obj) return;

    // get binding info
    const bindings = (obj.$tplVarBindings as Record<string, BindInfo>) || {};
    delete obj.$tplVarBindings;

    // replace binding
    for (const [k, { varName, originalValue }] of Object.entries(bindings)) {
      if (varMap.hasOwnProperty(varName)) {
        // image
        if (imageVars.has(varName)) {
          const id = obj.id; // image layer id
          if (id && k === "link") {
            obj[k] = {};
            const dataSeg = {
              id,
              data: varMap[varName],
            };
            json.data = json.data || [];
            const dataIdx = json.data.findIndex((d: any) => d.id === id);
            if (dataIdx === -1) {
              json.data.push(dataSeg);
            } else {
              json.data[dataIdx] = dataSeg;
            }
          } else {
            obj["data"] = varMap[varName];
          }
        } else {
          obj[k] = varMap[varName];
        }
      } else {
        obj[k] = originalValue;
        console.warn(`Variable ${varName} not found`);
      }
    }

    // walk children
    for (const [k, v] of Object.entries(obj)) {
      walk(v);
    }
  };

  walk(json);

  delete json._tplVars;
  return json;
}
