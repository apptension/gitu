import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';
import TextOptions = Widgets.TextOptions;

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
      ...config as TextOptions,
      keys: true,
      mouse: true,
      bottom: 0,
      tags: true,
      scrollable: true,
      alwaysScroll: true,
    });
    this.applyBorderStyleForFocusedElement(this.#box, this.#box);
  }
}
