import { Widgets } from 'blessed';

export interface Position {
  left?: Widgets.Types.TTopLeft;
  right?: Widgets.Types.TPosition;
  top?: Widgets.Types.TTopLeft;
  bottom?: Widgets.Types.TPosition;
}

// export type BlockCreator = (position?: Position) => Promise<Widgets.BoxElement>;
