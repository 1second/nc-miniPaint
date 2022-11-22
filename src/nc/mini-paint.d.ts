declare namespace MiniPaint {
  interface FileOpen {
    load_json(json: Object | string): Promise<void>;
  }

  interface FileSave {
    export_as_json(): string;
  }

  interface Layer {
    id: number;
    name: string;
    _varBinding?: VarBinding;
  }

  interface State {
    reset(): void;
    do_action(action: import("./actions/baseAction").BaseAction): Promise<void>;
  }

  interface AppConfig {
    layers: Layer[];
    _tplVars: import("./tplEval").TplVar[];
    _tplVarManager: import("./tplVar").TplVarManager;
    need_render: boolean;
  }
}

interface MiniPaintApp {
  onPaintInitialized: () => void;
  onPaintChange: (addSeq: number) => void;
  doDummyAction(desc: string): Promise<void>;
  ncPostExportJson(json: Record<string, any>): Record<string, any>;
  ncPreLoadJson(
    json: Record<string, any>,
    actions: import("./actions/baseAction").BaseAction[]
  ): Promise<void>;
  readonly FileOpen: MiniPaint.FileOpen;
  readonly FileSave: MiniPaint.FileSave;
  readonly State: MiniPaint.State;
  readonly AppConfig: MiniPaint.AppConfig;
}
