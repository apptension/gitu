import { Widgets } from 'blessed';
import { Git } from '../services/git';
import BlessedElement = Widgets.BlessedElement;

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

export abstract class Element<T extends Widgets.BlessedElement = Widgets.BlessedElement> {
  abstract get instance(): T;

  async init(): Promise<void> {}

  async onEnter(): Promise<void> {
    this.instance.focus();
  }

  applyBorderStyleForFocusedElement(
    handleFocusOn: BlessedElement = this.instance,
    applyStylesTo: BlessedElement = this.instance,
  ) {
    handleFocusOn.on('focus', () => {
      applyStylesTo.style.border.fg = 'red' as any;
    });
    handleFocusOn.on('blur', () => {
      applyStylesTo.style.border.fg = 'white' as any;
    });
  }
}
