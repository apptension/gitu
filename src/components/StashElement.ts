import blessed, { Widgets } from 'blessed';
import contrib from 'blessed-contrib';
import { Git } from '../services/git';
import { Element, ElementConfig } from './Element';

export class StashElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #git: Git;

  get instance() {
    return this.#box;
  }

  constructor({ git, ...config }: ElementConfig) {
    super();

    this.#git = git;
    this.#box = blessed.box({
      ...(config ?? {}),
      border: 'line',
      label: 'Stash',
    });
  }

  createStashListBox() : contrib.Widgets.TableElement {
    return contrib.table({
      parent: this.instance,
      top: 1,
      bottom: 0,
      width: '30%',
      columnWidth: [30],
      label: 'List',
      border: { type: 'line' },
      keys: true,
    });
  }

  createFilesModifiedBox() : contrib.Widgets.TableElement {
    return contrib.table({
      parent: this.instance,
      left: '30%',
      top: 1,
      bottom: 0,
      width: '70%',
      columnWidth: [30],
      label: 'Files modified',
      border: { type: 'line' },
      interactive: false as any,
    });
  }

  handleStashSelect(git: Git, filesModifiedBox: contrib.Widgets.TableElement) {
    return async (item: any, index: number) => {
      const files = await git.getModifiedFilesFromStash(index);
      await filesModifiedBox.setData({ headers: [''], data: files.map((file) => [file]) });
      filesModifiedBox.screen.render();
    };
  }

  override async init(): Promise<void> {
    const stashList = await this.#git.stashList();

    const stashListBox = this.createStashListBox();
    const filesModifiedBox = this.createFilesModifiedBox();

    (stashListBox as any).rows.on('select item', this.handleStashSelect(this.#git, filesModifiedBox));

    stashListBox.setData({ headers: [''], data: stashList.all.map((stashItem) => [stashItem.message]) });
    stashListBox.focus();
  }
}
