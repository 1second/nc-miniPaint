import { TplVarManager } from "../tplVar";
import { BaseAction } from "./baseAction";
import { deepCopy } from '../util';
export class EditVarAction extends BaseAction {
  before: MiniPaint.TplVar[];
  after: MiniPaint.TplVar[];
  paint: MiniPaintApp;
  constructor(
    paint: MiniPaintApp,
    before: MiniPaint.TplVar[],
    after: MiniPaint.TplVar[],
    done = false
  ) {
    super("edit-var", "编辑变量");
    this.paint = paint;
    this.before = before;
    this.after = after;
    this.is_done = done;
  }

  do(): void {
    if (this.is_done) return;
    super.do();
    const manager = this.paint.AppConfig._tplVarManager as TplVarManager;
    manager.setTplVars(this.after, true);
    this.paint.AppConfig.need_render = true;
  }

  undo(): void {
    if (!this.is_done) return;
    super.undo();
    const manager = this.paint.AppConfig._tplVarManager as TplVarManager;
    manager.setTplVars(this.before, true);
    this.paint.AppConfig.need_render = true;
  }

  static async runEdit(paint: MiniPaintApp, fn: () => void) {
    const manager = paint.AppConfig._tplVarManager as TplVarManager;
    const before = deepCopy(manager.tplVars);
    fn();
    const after = deepCopy(manager.tplVars);
    const action = new EditVarAction(paint, before, after, true);
    paint.AppConfig.need_render = true;
    return paint.State.do_action(action);
  }
}
