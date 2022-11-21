import { TplVarManager, BindInfo } from "../tplVar";
import { BaseAction } from "./baseAction";
import { Plugin } from "vite";
import { deepCopy } from '../util';

export class VarBindingAction extends BaseAction {
  before = null as BindInfo | null;
  constructor(
    public m: TplVarManager,
    public obj: any,
    public prop: string,
    public varName: string | null
  ) {
    super();
  }

  do(): void {
    if (this.is_done) return;
    super.do();
    this.before = deepCopy(this.m.getBinding(this.obj, this.prop));
    this.m.addBinding(this.varName, this.obj, this.prop);
    this.m.proxy.need_render = true;
  }

  undo(): void {
    if (!this.is_done) return;
    super.undo();
    const varName = (this.before && this.before.varName) || null;
    this.m.addBinding(varName, this.obj, this.prop);
    this.m.proxy.need_render = true;
  }
}
