import { reactive, Ref, ref } from "vue";
const proxyVersionObjKey = Symbol("proxyVersionObjKey");
const isProxyObjKey = Symbol("isProxyObjKey");
const originalObjKey = Symbol("originalObjKey");

export interface BindInfo {
  varName: string;
  originalValue: any;
}

interface HasBindingObj {
  [key: string]: any;
  $tplVarBindings: Record<string, BindInfo>;
}

// chinese, alphabet, number, underscore, dash
const validTplVarName = /^[a-zA-Z0-9_\u4e00-\u9fa5-]+$/;

export class TplVarManager {
  readonly originConfig: MiniPaint.AppConfig;
  readonly tplVars: MiniPaint.TplVar[];

  private proxyHandler: ProxyHandler<any>;
  readonly bindingSeq: Ref<number>;

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
    this.bindingSeq = ref(0);

    this.proxyHandler = {
      get: (target, prop) => {
        if (prop === originalObjKey) return target;
        if (prop === isProxyObjKey) return true;
        if (target === this.originConfig && prop === "_tplVarManager") {
          return this;
        }
        const t = target as HasBindingObj;
        if (
          typeof prop === "string" &&
          t.$tplVarBindings &&
          t.$tplVarBindings[prop]
        ) {
          const binding = t.$tplVarBindings[prop];
          const v = this.tplVars.find((i) => i.name == binding.varName);
          if (v) return v.value;
          console.warn(`变量 ${binding.varName} 不存在`, target, prop);
          return binding.originalValue;
        }
        return this.makeProxy(target[prop]);
      },
      set: (target, prop, value) => {
        if (
          typeof value === "object" &&
          value !== null &&
          value !== "undefined"
        ) {
          if (value[originalObjKey]) {
            // console.warn("set proxy to proxy", {
            //   target,
            //   prop,
            //   value,
            // });
            value = value[originalObjKey];
          }
        }

        const t = target as HasBindingObj;
        if (
          typeof prop === "string" &&
          t.$tplVarBindings &&
          t.$tplVarBindings[prop]
        ) {
          const binding = t.$tplVarBindings[prop];
          const v = this.tplVars.find((i) => i.name == binding.varName);
          if (!v) {
            console.warn(`变量 ${binding.varName} 不存在`, target, prop);
            return false;
          }
          if (v.type !== "expression" && !v.editLock) {
            v.value = value;
            return true;
          }
          return false;
        }

        target[prop] = value;
        return true;
      },
    };
  }

  setTplVars(vars: MiniPaint.TplVar[], overwrite = false) {
    if (overwrite) {
      console.log(
        JSON.parse(JSON.stringify(this.tplVars)),
        JSON.parse(JSON.stringify(vars))
      );
      this.tplVars.splice(0, this.tplVars.length, ...vars);
      return;
    }
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

    if (v.type === "expression") {
      v.editLock = true;
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
    const exist = this.tplVars.findIndex((i) => i.name == v.name);
    if (exist > -1) {
      this.tplVars.splice(exist, 1, v);
      return;
    }
    this.tplVars.push(v);
  }

  checkBinding(varName: string | null, obj: any, prop: string): string {
    if (varName !== null) {
      const v = this.tplVars.find((i) => i.name == varName);
      if (!v) return `变量 ${varName} 不存在`;
    }

    // 正常情况下只会出现代理对象，此处做下断言，后续有bug时能定位到问题
    if (!obj[isProxyObjKey]) return "内部错误: NOT_A_PROXY";

    if (obj[prop] === undefined) return `对象 ${obj} 没有属性 ${prop}`;

    // if (typeof obj[prop] !== v.type) {
    // return `对象 ${obj} 的属性 ${prop} 类型不匹配`;
    // }

    return "";
  }

  addBinding(varName: string | null, obj: any, prop: string) {
    const err = this.checkBinding(varName, obj, prop);
    if (err) {
      throw new Error(err);
    }
    this.bindingSeq.value++;
    const originalObj = obj[originalObjKey] as HasBindingObj;
    const bindings =
      originalObj.$tplVarBindings || (originalObj.$tplVarBindings = {});
    if (varName === null) {
      if (bindings[prop]) {
        originalObj[prop] = bindings[prop].originalValue;
        delete bindings[prop];
      }
      return;
    }
    if (bindings[prop]) {
      bindings[prop].varName = varName;
    } else {
      bindings[prop] = {
        varName,
        originalValue: obj[prop],
      };
    }
  }

  getBinding(obj: any, prop: string): BindInfo | null {
    if (typeof obj !== "object" || obj === null) return null;
    const originalObj = obj[originalObjKey] as HasBindingObj;
    const bindings = originalObj.$tplVarBindings;
    if (!bindings) return null;
    return bindings[prop] || null;
  }
}

export function ncConfigWithVar(config: MiniPaint.AppConfig) {
  return new TplVarManager(config).proxy;
}
