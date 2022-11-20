import { reactive } from "vue";
const proxyVersionObjKey = Symbol("proxyVersionObjKey");
const isProxyObjKey = Symbol("isProxyObjKey");

// chinese, alphabet, number, underscore, dash
const validTplVarName = /^[a-zA-Z0-9_\u4e00-\u9fa5-]+$/;

export class TplVarManager {
  readonly originConfig: MiniPaint.AppConfig;
  readonly tplVars: MiniPaint.TplVar[];

  private proxyHandler: ProxyHandler<any>;

  constructor(originConfig: MiniPaint.AppConfig) {
    (window as any).tplVarManager = this;
    this.originConfig = originConfig;
    this.tplVars = reactive(
      JSON.parse(
        JSON.stringify(
          originConfig._tplVars || [
            {
              name: "版权信息",
              type: "string",
              value: "NC模板图片渲染器, By 一秒云科技",
            },
          ]
        )
      )
    );

    this.proxyHandler = {
      get: (target, prop) => {
        if (prop === isProxyObjKey) return true;
        if (target === this.originConfig && prop === "_tplVarManager") {
          return this;
        }
        return this.makeProxy(target[prop]);
      },
      set: (target, prop, value) => {
        target[prop] = value;
        return true;
      },
    };
  }

  setTplVars(vars: MiniPaint.TplVar[]) {
    vars.forEach((v) => {
      const idx = this.tplVars.findIndex((i) => v.name === i.name);
      if (idx > -1) {
        this.tplVars.splice(idx, 1, v);
      } else {
        this.tplVars.push(v);
      }
    });
  }

  get proxy() {
    return this.makeProxy(this.originConfig);
  }

  private makeProxy(obj: any): any {
    if (typeof obj !== "object" || obj === null) return obj;
    if (obj && obj[isProxyObjKey]) return obj;
    if (obj && obj[proxyVersionObjKey]) return obj[proxyVersionObjKey];
    const proxy = new Proxy(obj, this.proxyHandler);
    obj[proxyVersionObjKey] = proxy;
    return proxy;
  }

  checkVar(v: MiniPaint.TplVar): string {
    v.name = v.name.trim();
    if (!v.name) {
      return "变量名不能为空";
    }

    const exist = this.tplVars.find((i) => i.name == v.name);
    if (exist && exist.type !== v.type) return "不能修改已存在变量类型";

    if (!validTplVarName.test(v.name)) {
      return "变量名只能包含中文、字母、数字、下划线、中划线";
    }

    if (v.type === "string") {
      v.value = `${v.value}`;
      return "";
    }
    if (v.type === "number") {
      v.value = parseFloat(`${v.value}`);
      if (isNaN(v.value)) {
        return "数值类型的变量值必须是数字";
      }
      return "";
    }
    if (v.type === "boolean") {
      v.value = !!v.value;
      return "";
    }
    if (v.type === "image") {
      return "";
    }
    if (v.type === "object") {
      if (typeof v.value === "object") return "";
      try {
        v.value = JSON.parse(v.value);
      } catch (e) {
        return "对象类型的变量值必须是合法的JSON字符串";
      }
      return "";
    }
    return `未知类型的变量 ${v.type}`;
  }

  addVar(v: MiniPaint.TplVar) {
    const err = this.checkVar(v);
    if (err) {
      throw new Error(err);
    }
    const exist = this.tplVars.find((i) => i.name == v.name);
    if (exist) {
      Object.assign(exist, v);
      return;
    }
    this.tplVars.push(v);
  }
}

export function ncConfigWithVar(config: MiniPaint.AppConfig) {
  return new TplVarManager(config).proxy;
}
