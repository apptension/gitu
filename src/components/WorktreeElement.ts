import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { TreeElement } from './TreeElement';
import { Git } from '../services/git';

export class WorktreeElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #treeBox: TreeElement;

  readonly #git: Git;

  #currentBranchName = '';

  get instance() {
    return this.#box;
  }

  constructor({ git, ...config }: ElementConfig) {
    super();

    this.#git = git;
    this.#box = blessed.box({
      ...(config ?? {}),
      border: 'line',
      label: 'Worktree',
    });
    this.#treeBox = new TreeElement({
      git,
      left: 0,
      top: 1,
      width: '30%',
      bottom: 0,
      parent: this.#box,
    });
  }

  override async init(): Promise<void> {
    await this.#treeBox.init(() => {
      // this.#logBox.onEnter();
      this.#box.screen.render();
    });
    this.#currentBranchName = await this.#git.currentBranchName();
    this.#box.setLabel(`Worktree - ${this.#currentBranchName}`);
  }

  override async onEnter(): Promise<void> {
    return this.#treeBox.onEnter();
  }
}
