import contrib from 'blessed-contrib';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';

export class StashModifiedFilesElement extends Element {
  readonly #box: contrib.Widgets.TableElement;

  readonly #git: Git;

  get instance() {
    return this.#box;
  }

  get rows() {
    return (this.#box as any).rows;
  }

  setData(files: string[]) {
    this.#box.setData({ headers: [''], data: files.map((file) => [file]) });
    (this.#box as any).rows.selected = 0;
  }

  constructor({ git, ...config } : ElementConfig) {
    super();
    this.#git = git;
    this.#box = contrib.table({
      parent: config.parent,
      top: 1,
      columnWidth: [1000],
      border: { type: 'line' },
      keys: true,
      mouse: true,
      left: '30%',
      height: '30%',
      width: '70%',
      label: 'Modified files',
    });
    this.applyBorderStyleForFocusedElement((this.#box as any).rows, this.#box);
  }
}
