import { TplVarManager } from "../tplVar";
import { BaseAction } from "./baseAction";
export class EditVarAction extends BaseAction {
  before: string;
  after: string;
  paint: MiniPaintApp;
  constructor(
    paint: MiniPaintApp,
    before: string,
    after: string,
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
    manager.setTplVars(JSON.parse(this.after), true);
  }

  undo(): void {
    if (!this.is_done) return;
    super.undo();
    console.log(this.before, this.after);
    const manager = this.paint.AppConfig._tplVarManager as TplVarManager;
    manager.setTplVars(JSON.parse(this.before), true);
  }

  static async runEdit(paint: MiniPaintApp, fn: () => void) {
    const manager = paint.AppConfig._tplVarManager as TplVarManager;
    const before = JSON.stringify(manager.tplVars);
    fn();
    const after = JSON.stringify(manager.tplVars);
    if (after === before) {
      return;
    }
    const action = new EditVarAction(paint, before, after, true);
    return paint.State.do_action(action);
  }
}
