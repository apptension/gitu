import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';
import { CommitsElement } from './CommitsElement';
import { BranchesListElement } from './BranchesListElement';

export class BranchesElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #commitsBox: CommitsElement;

  readonly #branchesBox: BranchesListElement;

  readonly #git: Git;

  get instance() {
    return this.#box;
  }

  constructor({ git, ...config }: ElementConfig) {
    super();

    this.#git = git;
    this.#box = blessed.box({
      ...config,
      border: 'line',
      label: 'Branches',
    });
    this.#branchesBox = new BranchesListElement({
      git,
      left: 0,
      top: 1,
      width: '50%-1',
      bottom: 0,
      parent: this.#box,
    });
    this.#commitsBox = new CommitsElement({
      git,
      right: 0,
      top: 1,
      width: '50%-1',
      bottom: 0,
      parent: this.#box,
    });
    this.applyBorderStyleForFocusedElement();
  }

  override async init(): Promise<void> {
    await this.#commitsBox.init(() => {
      this.#branchesBox.onEnter();
      this.#box.screen.render();
    });
    await this.#branchesBox.init(() => {
      this.#commitsBox.onEnter();
      this.#box.screen.render();
    }, async (branch) => {
      await this.#commitsBox.switchBranch(branch);
      this.#commitsBox.onEnter();
      this.#box.screen.render();
    });
  }

  override async onEnter(): Promise<void> {
    await this.#branchesBox.onEnter();
  }
}
