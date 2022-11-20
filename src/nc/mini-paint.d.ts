declare namespace MiniPaint {
  interface FileOpen {
    load_json(json: Object | string): void;
  }

  interface FileSave {
    export_as_json(): string;
  }

  interface State {
    reset(): void;
  }

  interface AppConfig {
    layers: Layer[];
    _tplVars: TplVar[];
    _tplVarManager: TplVarManager;
  }

  type TplVarTypeMap = {
    string: string;
    number: number;
    boolean: boolean;
    image: string;
    object: any;
  };

  type TplVarT<Type extends keyof TplVarTypeMap> = {
    name: string;
    type: Type;
    value: TplVarTypeMap[Type];
    expression?: string;
  };

  type StringTplVar = TplVarT<"string">;
  type NumberTplVar = TplVarT<"number">;
  type BooleanTplVar = TplVarT<"boolean">;
  type ImageTplVar = TplVarT<"image">;
  type ObjectTplVar = TplVarT<"object">;

  type TplVar = TplVarT<keyof TplVarTypeMap>;

  type TplVar1 = StringTplVar | NumberTplVar | BooleanTplVar;

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
  readonly FileOpen: MiniPaint.FileOpen;
  readonly FileSave: MiniPaint.FileSave;
  readonly State: MiniPaint.State;
  readonly AppConfig: MiniPaint.AppConfig;
}
