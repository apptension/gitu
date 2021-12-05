import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { TreeElement } from './TreeElement';
import { Git } from '../services/git';
import { DiffElement } from './DiffElement';

export class WorktreeElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #treeBox: TreeElement;

  readonly #diffElement: DiffElement;

  readonly #cachedDiffElement: DiffElement;

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
    this.#diffElement = new DiffElement({
      git,
      right: 0,
      top: 1,
      width: '70%-1',
      height: '50%-1',
      label: 'Diff',
      border: { type: 'line' },
      parent: this.#box,
    });
    this.#cachedDiffElement = new DiffElement({
      git,
      right: 0,
      bottom: 0,
      width: '70%-1',
      height: '50%-2',
      label: 'Diff index',
      border: { type: 'line' },
      parent: this.#box,
    });
  }

  override async init(): Promise<void> {
    await this.#treeBox.init(() => {
      this.#diffElement.onEnter();
      this.#box.screen.render();
    }, async (path, useNormal, useCached) => {
      const diffCached = useCached ? await this.#git.getFileDiff(path, true) : '';
      this.#cachedDiffElement.setContent(diffCached);
      const diffNormal = useNormal ? await this.#git.getFileDiff(path, false) : '';
      this.#diffElement.setContent(diffNormal);
      if (useNormal) {
        await this.#diffElement.onEnter();
      } else if (useCached) {
        await this.#cachedDiffElement.onEnter();
      }
      this.#box.screen.render();
    });
    await this.#diffElement.init(() => {
      this.#cachedDiffElement.onEnter();
      this.#box.screen.render();
    });
    await this.#cachedDiffElement.init(() => {
      this.#treeBox.onEnter();
      this.#box.screen.render();
    });
    this.#currentBranchName = await this.#git.currentBranchName();
    this.#box.setLabel(`Worktree - ${this.#currentBranchName}`);
  }

  override async onEnter(): Promise<void> {
    return this.#treeBox.onEnter();
  }
}
