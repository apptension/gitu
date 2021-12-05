import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';

export class DiffElement extends Element {
  readonly #box: Widgets.TextElement;

  readonly #git: Git;

  get instance() {
    return this.#box;
  }

  setContent(diff: string) {
    this.#box.setContent(diff);
    (this.#box as any).resetScroll();
  }

  constructor({ git, ...config } : ElementConfig) {
    super();
    this.#git = git;
    this.#box = blessed.text({
      parent: config.parent,
      border: { type: 'line' },
      keys: true,
      left: '30%',
      top: '31%',
      bottom: 0,
      width: '70%',
      label: 'Diff',
      tags: true,
      scrollable: true,
      alwaysScroll: true,
    });
    this.applyBorderStyleForFocusedElement(this.#box, this.#box);
  }
}
