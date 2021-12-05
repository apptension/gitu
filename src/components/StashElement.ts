import blessed, { Widgets } from 'blessed';
import contrib from 'blessed-contrib';
import { Git } from '../services/git';
import { Element, ElementConfig } from './Element';
import { StashListElement } from './StashListElement';
import { DiffElement } from './DiffElement';
import { StashModifiedFilesElement } from './StashModifiedFilesElement';

export class StashElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #stashListBox: StashListElement;

  readonly #filesModifiedBox: StashModifiedFilesElement;

  readonly #diffBox: DiffElement;

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
    this.#stashListBox = new StashListElement({ git, parent: this.#box });
    this.#filesModifiedBox = new StashModifiedFilesElement({ git, parent: this.#box });
    this.#stashMenuBox = this.createStashMenuBox();
    this.#diffBox = new DiffElement({ git, parent: this.#box });
    this.#screen = this.#box.screen;

    this.#stashListBox.rows.key(['tab'], () => { this.#filesModifiedBox.focus(); this.#screen.render(); });
    this.#filesModifiedBox.rows.key(['tab'], () => { this.#diffBox.focus(); this.#screen.render(); });
    this.#diffBox.instance.key(['tab'], () => { this.#stashListBox.focus(); this.#screen.render(); });

    this.applyBorderStyleForFocusedElement((this.#stashMenuBox as any).rows, this.#stashMenuBox);
  }

  createStashMenuBox() : contrib.Widgets.TableElement {
    const stashMenuBox = contrib.table({
      parent: null,
      label: '',
      border: { type: 'line' },
      keys: true,
      columnWidth: [1000],
      top: 'center',
      left: 'center',
      width: '35%',
      height: '20%',
      data: { headers: [''], data: [['apply'], ['drop'], ['rename']] },
    });
    (stashMenuBox as any).rows.key(['escape'], () => {
      stashMenuBox.detach();
      this.#selectedStashIndex = null;
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

  handleStashSelect() {
    return async (item: any, index: number) => {
      const files = await this.#git.getModifiedFilesFromStash(index);
      this.#filesModifiedBox.setData(files);

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

  handleStashEnter() {
    return (item: any, index: number) => {
      this.#selectedStashIndex = index;
      this.instance.append(this.#stashMenuBox);
      (this.#stashMenuBox as any).rows.selected = 0;
      this.#stashMenuBox.setLabel(
        this.shrinkLabel(this.#stashListBox.stashes[index].message, this.#stashMenuBox.width as number - 7),
      );
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
    await this.#stashListBox.reload();
    this.#selectedStashIndex = null;
  }

  override async init(): Promise<void> {
    this.#stashListBox.rows.on('select item', this.handleStashSelect());
    this.#stashListBox.rows.on('select', this.handleStashEnter());
    await this.reloadStashes();
  }

  override async onEnter(): Promise<void> {
    this.#stashListBox.focus();
  }
}
