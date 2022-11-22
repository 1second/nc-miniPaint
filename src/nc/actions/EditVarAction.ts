import { TplVarManager } from "../tplVar";
import { BaseAction } from "./baseAction";
import { deepCopy } from "../util";
export class EditVarAction extends BaseAction {
  before?: MiniPaint.TplVar[];
  after?: MiniPaint.TplVar[];

  constructor(private paint: MiniPaintApp, private fn: () => void) {
    super("edit-var", "编辑变量");
  }

  do(): void {
    super.do();

    this.paint.AppConfig.need_render = true;
    if (this.after) {
      const manager = this.paint.AppConfig._tplVarManager as TplVarManager;
      manager.setTplVars(this.after, true);
      return;
    }
    this.before = deepCopy(this.paint.AppConfig._tplVarManager.tplVars);
    this.fn();
    this.after = deepCopy(this.paint.AppConfig._tplVarManager.tplVars);
  }

  undo(): void {
    super.undo();

    const manager = this.paint.AppConfig._tplVarManager as TplVarManager;
    manager.setTplVars(this.before!, true);
    this.paint.AppConfig.need_render = true;
  }

  static async runEdit(paint: MiniPaintApp, fn: () => void) {
    return paint.State.do_action(new EditVarAction(paint, fn));
  }
}
