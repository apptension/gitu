import blessed, { Widgets } from 'blessed';
import { Git } from '../services/git';
import { Element, ElementConfig } from './Element';
import { StashListElement } from './StashListElement';
import { DiffElement } from './DiffElement';
import { StashModifiedFilesElement } from './StashModifiedFilesElement';
import { PopupElement } from './PopupElement';

export class StashElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #stashListBox: StashListElement;

  readonly #filesModifiedBox: StashModifiedFilesElement;

  readonly #diffBox: DiffElement;

  readonly #popup: PopupElement;

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
    this.#popup = new PopupElement({ git, width: '35%', height: '20%' });
    this.#diffBox = new DiffElement({
      git, parent: this.#box, left: '30%', top: '31%', width: '70%', label: 'Diff', border: { type: 'line' },
    });
    this.#screen = this.#box.screen;

    this.#stashListBox.rows.key(['tab'], () => { this.#filesModifiedBox.focus(); this.#screen.render(); });
    this.#filesModifiedBox.rows.key(['tab'], () => { this.#diffBox.focus(); this.#screen.render(); });
    this.#diffBox.instance.key(['tab'], () => { this.#stashListBox.focus(); this.#screen.render(); });
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

  handleStashEnter() {
    return (item: any, index: number) => {
      this.#selectedStashIndex = index;
      this.#popup.show(this.#box, this.#stashListBox);
      this.#popup.renderMenu(
        ['apply', 'drop', 'rename'],
        [this.applyStashHandler.bind(this), this.dropStashHandler.bind(this), this.renameStashHandler.bind(this)],
      );
      this.#popup.setLabel(this.#stashListBox.stashes[index].message);
      this.#screen.render();
    };
  }

  async applyStashHandler() {
    console.error('Not implemented yet.');
  }

  async dropStashHandler() {
    if (this.#selectedStashIndex != null) {
      await this.#git.dropStash(this.#selectedStashIndex);
      this.#popup.hide();
      await this.reloadStashes();
      this.#screen.render();
    }
  }

  async renameStashHandler() {
    this.#popup.renderTextInput('Enter new stash name: ', this.renameStashSubmitHandler.bind(this));
    this.#screen.render();
  }

  async renameStashSubmitHandler(value: string) {
    if (this.#selectedStashIndex != null) {
      await this.#git.renameStash(this.#selectedStashIndex, value);
      this.#popup.hide();
      await this.reloadStashes();
      this.#screen.render();
    }
  }

  async reloadStashes() {
    await this.#stashListBox.reload();
    this.#selectedStashIndex = null;
    if (this.#stashListBox.stashes) {
      await this.handleStashSelect()({}, 0);
    }
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
