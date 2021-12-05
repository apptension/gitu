import blessed, { Widgets } from 'blessed';
import { Git } from '../services/git';
import { Element, ElementConfig } from './Element';
import { BranchesListElement } from './BranchesListElement';
import { CommitsElement } from './CommitsElement';

export class ChangelogElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #sourceBranchSelector: BranchesListElement;

  readonly #targetBranchSelector: BranchesListElement;

  readonly #commitsBox: CommitsElement;

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
      label: 'Changelog',
    });
    this.#sourceBranchSelector = new BranchesListElement({
      git,
      left: 0,
      top: 1,
      width: '25%',
      bottom: 0,
      parent: this.#box,
      label: 'Source branch',
    });
    this.#targetBranchSelector = new BranchesListElement({
      git,
      left: '25%',
      top: 1,
      width: '25%',
      bottom: 0,
      parent: this.#box,
      label: 'Target branch',
    });
    this.#commitsBox = new CommitsElement({
      git,
      left: '50%',
      top: 1,
      right: 0,
      bottom: 0,
      parent: this.#box,
    });
  }

  async showBranchesDiff(sourceBranch: string, targetBranch: string) {
    await this.#commitsBox.showDiffBetweenBranches(sourceBranch, targetBranch);
    this.#box.screen.render();
  }

  async clearBranchesDiff() {
    this.#commitsBox.clear();
    this.#box.screen.render();
  }

  async handleBranchSelect() {
    if (
      this.#sourceBranchSelector.currentBranch
          && this.#targetBranchSelector.currentBranch
          && this.#sourceBranchSelector.currentBranch !== this.#targetBranchSelector.currentBranch
    ) {
      await this.showBranchesDiff(this.#sourceBranchSelector.currentBranch, this.#targetBranchSelector.currentBranch);
    } else {
      await this.clearBranchesDiff();
    }
  }

  override async init(): Promise<void> {
    await this.#sourceBranchSelector.init(() => {
      this.#targetBranchSelector.onEnter();
      this.#box.screen.render();
    }, async () => {
      await this.handleBranchSelect();
    });
    await this.#targetBranchSelector.init(() => {
      this.#commitsBox.onEnter();
      this.#box.screen.render();
    }, async () => {
      await this.handleBranchSelect();
    });
    await this.#commitsBox.init(() => {
      this.#sourceBranchSelector.onEnter();
      this.#box.screen.render();
    });
  }

  override async onEnter(): Promise<void> {
    await this.#sourceBranchSelector.onEnter();
    this.#box.screen.render();
  }
}
