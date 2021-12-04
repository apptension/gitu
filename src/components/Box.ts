import { Widgets } from 'blessed';

export interface BoxConfig {
  left?: Widgets.Types.TTopLeft;
  right?: Widgets.Types.TPosition;
  top?: Widgets.Types.TTopLeft;
  bottom?: Widgets.Types.TPosition;
  width?: Widgets.Types.TPosition;
  height?: Widgets.Types.TPosition;
  parent?: Widgets.Node;
}

export interface Box {
  get instance(): Widgets.BoxElement | null;
  postInit?(): Promise<void>
  build(config?: BoxConfig): void;
}
