declare namespace MiniPaint {
  interface FileOpen {
    load_json(json: Object | string): Promise<void>;
  }

  interface FileSave {
    export_as_json(): string;
  }

  interface State {
    reset(): void;
    do_action(action: import("./actions/baseAction").BaseAction): Promise<void>;
  }

  interface AppConfig {
    layers: Layer[];
    _tplVars: TplVar[];
    _tplVarManager: import("./tplVar").TplVarManager;
    need_render: boolean;
  }

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

  type TplVar1 = TplVarT<keyof TplVarTypeMap>;

  type TplVar =
    | StringTplVar
    | NumberTplVar
    | BooleanTplVar
    | ImageTplVar
    | ObjectTplVar;

  interface Layer {
    id: number;
    name: string;
    _varBinding?: VarBinding;
  }

  interface VarBinding {
    [key: string]: string;
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
