import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { TreeElement } from './TreeElement';
import { Git } from '../services/git';

export class WorktreeElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #treeBox: TreeElement;

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
      label: 'Worktree',
    });
    this.#treeBox = new TreeElement({
      git,
      left: 0,
      top: 1,
      width: '50%-1',
      bottom: 0,
      parent: this.#box,
    });
  }

  override async init(): Promise<void> {
    await this.#treeBox.init(() => {
      // this.#logBox.onEnter();
      this.#box.screen.render();
    });
  }

  override async onEnter(): Promise<void> {
    return this.#treeBox.onEnter();
  }
}
