import contrib from 'blessed-contrib';
import { DefaultLogFields, ListLogLine } from 'simple-git';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';

export class StashListElement extends Element {
  readonly #box: contrib.Widgets.TableElement;

  readonly #git: Git;

  #stashes : readonly (DefaultLogFields & ListLogLine)[];

  get instance() {
    return this.#box;
  }

  get rows() {
    return (this.#box as any).rows;
  }

  get stashes() {
    return this.#stashes;
  }

  async reload() {
    const stashList = await this.#git.stashList();
    this.#stashes = stashList.all;
    this.#box.setData({ headers: [''], data: this.#stashes.map((stashItem) => [stashItem.message]) });
    this.rows.selected = 0;
  }

  constructor({ git, ...config } : ElementConfig) {
    super();
    this.#git = git;
    this.#box = contrib.table({
      parent: config.parent,
      top: 1,
      bottom: 0,
      width: '30%',
      columnWidth: [1000],
      label: 'Stashes',
      border: { type: 'line' },
      keys: true,
    });
    this.#stashes = [];
    this.applyBorderStyleForFocusedElement((this.#box as any).rows, this.#box);
  }
}
