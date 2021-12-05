import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';

export class StashModifiedFilesElement extends Element {
  readonly #box: Widgets.ListElement;

  readonly #git: Git;

  get instance() {
    return this.#box;
  }

  setData(files: string[]) {
    this.#box.clearItems();
    files.forEach((file) => {
      this.#box.addItem(file);
    });
    this.#box.select(0);
  }

  constructor({ git, ...config } : ElementConfig) {
    super();
    this.#git = git;
    this.#box = blessed.list({
      parent: config.parent,
      top: 1,
      border: 'line',
      keys: true,
      mouse: true,
      left: '30%',
      height: '30%',
      width: '70%',
      label: 'Modified files',
    });
    this.applyBorderStyleForFocusedElement(this.#box, this.#box);
  }
}
