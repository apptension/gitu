import { DefaultLogFields, ListLogLine } from 'simple-git';
import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';
import { DefaultTheme } from '../themes/default';

export class StashListElement extends Element {
  readonly #box: Widgets.ListElement;

  readonly #git: Git;

  #stashes : readonly (DefaultLogFields & ListLogLine)[];

  get instance() {
    return this.#box;
  }

  get stashes() {
    return this.#stashes;
  }

  async reload() {
    const stashList = await this.#git.stashList();
    this.#stashes = stashList.all;
    this.#box.clearItems();
    this.#stashes.forEach((stashItem) => {
      this.#box.addItem(stashItem.message);
    });
    this.#box.select(0);
  }

  constructor({ git, ...config } : ElementConfig) {
    super();
    this.#git = git;
    this.#box = blessed.list({
      parent: config.parent,
      top: 1,
      bottom: 0,
      width: '30%',
      style: DefaultTheme.listStyle,
      label: 'Stashes',
      border: 'line',
      keys: true,
      mouse: true,
    });
    this.#stashes = [];
    this.applyBorderStyleForFocusedElement(this.#box, this.#box);
  }
}
