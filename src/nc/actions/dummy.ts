import { BaseAction } from "./baseAction";

export class DummyAction extends BaseAction {
  constructor(desc: string) {
    super("dummy", desc);
  }
}
