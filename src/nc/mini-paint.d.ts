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
}

interface MiniPaintApp {
  onPaintInitialized: () => void;
  onPaintChange: (addSeq: number) => void;
  readonly FileOpen: MiniPaint.FileOpen;
  readonly FileSave: MiniPaint.FileSave;
  readonly State: MiniPaint.State;
}
