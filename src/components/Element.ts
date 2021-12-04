import { Widgets } from 'blessed';
import { Git } from '../services/git';

export interface ElementConfig {
  left?: Widgets.Types.TTopLeft;
  right?: Widgets.Types.TPosition;
  top?: Widgets.Types.TTopLeft;
  bottom?: Widgets.Types.TPosition;
  width?: Widgets.Types.TPosition;
  height?: Widgets.Types.TPosition;
  parent?: Widgets.Node;
  git: Git;
}

export abstract class Element<T extends Widgets.BoxElement = Widgets.BoxElement> {
  abstract get instance(): T;
  async init(): Promise<void> {}
}
