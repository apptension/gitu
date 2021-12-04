import blessed, { Widgets } from 'blessed';
import contrib from 'blessed-contrib';
import { Git } from '../services/git';
import { Element, ElementConfig } from './Element';

export class StashElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #stashListBox: contrib.Widgets.TableElement;

  readonly #filesModifiedBox: contrib.Widgets.TableElement;

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
    this.#stashListBox = this.createStashListBox();
    this.#filesModifiedBox = this.createFilesModifiedBox();
    this.applyBorderStyleForFocusedElement((this.#stashListBox as any).rows, this.#stashListBox);
    this.applyBorderStyleForFocusedElement((this.#filesModifiedBox as any).rows, this.#filesModifiedBox);
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
    (this.#stashListBox as any).rows.on('select item', this.handleStashSelect(this.#git, this.#filesModifiedBox));
    this.#stashListBox.setData({ headers: [''], data: stashList.all.map((stashItem) => [stashItem.message]) });
  }

  override async onEnter(): Promise<void> {
    this.#stashListBox.focus();
  }
}
