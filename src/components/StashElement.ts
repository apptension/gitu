import blessed, { Widgets } from 'blessed';
import contrib from 'blessed-contrib';
import { Git } from '../services/git';
import { Element, ElementConfig } from './Element';

export class StashElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #stashListBox: contrib.Widgets.TableElement;

  readonly #filesModifiedBox: contrib.Widgets.TableElement;

  readonly #diffBox: Widgets.TextElement;

  readonly #stashMenuBox: contrib.Widgets.TableElement;

  readonly #screen: Widgets.Screen;

  #selectedStashIndex: number | null = null;

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
    this.#stashMenuBox = this.createStashMenuBox();
    this.#diffBox = this.createDiffBox();
    this.applyBorderStyleForFocusedElement((this.#stashListBox as any).rows, this.#stashListBox);
    this.applyBorderStyleForFocusedElement((this.#filesModifiedBox as any).rows, this.#filesModifiedBox);
    this.applyBorderStyleForFocusedElement((this.#stashMenuBox as any).rows, this.#stashMenuBox);
    this.#screen = this.#stashListBox.screen;
  }

  defaultTableOptions() : contrib.Widgets.TableOptions {
    return {
      parent: this.instance,
      top: 1,
      width: '30%',
      columnWidth: [1000],
      label: '',
      border: { type: 'line' },
      keys: true,
    };
  }

  createStashListBox() : contrib.Widgets.TableElement {
    return contrib.table({ ...this.defaultTableOptions(), bottom: 0, label: 'Stashes' });
  }

  createStashMenuBox() : contrib.Widgets.TableElement {
    const stashMenuBox = contrib.table({
      ...this.defaultTableOptions(),
      parent: null,
      top: 'center',
      left: 'center',
      width: '35%',
      height: '20%',
    });
    (stashMenuBox as any).rows.key(['escape'], () => {
      stashMenuBox.detach();
      this.#stashListBox.focus();
      this.#screen.render();
    });
    (stashMenuBox as any).rows.on('select', this.handleStashMenuOptionSelect());
    return stashMenuBox;
  }

  createRenameStashBox() : Widgets.TextboxElement {
    const renameStashBox = blessed.textbox({
      parent: this.instance,
      top: 'center',
      left: 'center',
      width: '35%',
      height: '20%',
      inputOnFocus: true,
      border: { type: 'line' },
      label: 'Enter new stash name: ',
      padding: 2,
    });
    this.applyBorderStyleForFocusedElement(renameStashBox, renameStashBox);

    renameStashBox.key(['escape'], () => {
      renameStashBox.detach();
      this.#stashMenuBox.focus();
      this.#screen.render();
    });
    renameStashBox.on('submit', async (value: string) => {
      if (this.#selectedStashIndex != null) {
        await this.#git.renameStash(this.#selectedStashIndex, value);
        renameStashBox.detach();
        this.#stashMenuBox.detach();
        this.#stashListBox.focus();
        await this.reloadStashes();
        this.#screen.render();
      }
    });
    return renameStashBox;
  }

  createFilesModifiedBox() : contrib.Widgets.TableElement {
    return contrib.table({
      ...this.defaultTableOptions(),
      left: '30%',
      height: '30%',
      // bottom: 0,
      width: '70%',
      label: 'Files modified',
      interactive: false as any,
    });
  }

  createDiffBox() : Widgets.TextElement {
    return blessed.text({
      ...this.defaultTableOptions(),
      left: '30%',
      top: '31%',
      bottom: 0,
      width: '70%',
      label: 'Diff',
      tags: true,
    });
  }

  handleStashSelect() {
    return async (item: any, index: number) => {
      const files = await this.#git.getModifiedFilesFromStash(index);
      this.#filesModifiedBox.setData({ headers: [''], data: files.map((file) => [file]) });
      const diff = await this.#git.getStashDiff(index);
      this.#diffBox.setContent(diff);
      this.#screen.render();
    };
  }

  shrinkLabel(label: string, maxWidth: number) {
    if (label.length > maxWidth) {
      return `${label.substring(0, maxWidth)}...`;
    }
    return label;
  }

  handleStashEnter(stashes: any) {
    return (item: any, index: number) => {
      this.#selectedStashIndex = index;
      this.instance.append(this.#stashMenuBox);
      (this.#stashMenuBox as any).rows.selected = 0;
      this.#stashMenuBox.setData({ headers: [''], data: [['apply'], ['drop'], ['rename']] });
      this.#stashMenuBox.setLabel(this.shrinkLabel(stashes[index].message, this.#stashMenuBox.width as number - 7));
      this.#stashMenuBox.focus();
      this.#screen.render();
    };
  }

  handleStashMenuOptionSelect() {
    const ACTION_APPLY = 0;
    const ACTION_DROP = 1;
    const ACTION_RENAME = 2;

    return async (item: any, index: number) => {
      if (index === ACTION_APPLY) {
        console.error('Not implemented yet.');
      } else if (index === ACTION_DROP) {
        if (this.#selectedStashIndex != null) {
          await this.#git.dropStash(this.#selectedStashIndex);
          this.#stashMenuBox.detach();
          this.#stashListBox.focus();
          await this.reloadStashes();
          this.#screen.render();
        }
      } else if (index === ACTION_RENAME) {
        const renameStashBox = this.createRenameStashBox();
        renameStashBox.focus();
        this.#screen.render();
      }
    };
  }

  async reloadStashes() {
    const stashList = await this.#git.stashList();
    const stashes = stashList.all;
    this.#stashListBox.setData({ headers: [''], data: stashes.map((stashItem) => [stashItem.message]) });
    (this.#stashListBox as any).rows.on('select', this.handleStashEnter(stashes));
    (this.#stashListBox as any).rows.selected = 0;
    this.#selectedStashIndex = null;
  }

  override async init(): Promise<void> {
    (this.#stashListBox as any).rows.on('select item', this.handleStashSelect());
    await this.reloadStashes();
  }

  override async onEnter(): Promise<void> {
    this.#stashListBox.focus();
  }
}
