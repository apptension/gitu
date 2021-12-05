import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';
import { CommitsElement } from './CommitsElement';
import { BranchesListElement } from './BranchesListElement';
import { PopupElement } from './PopupElement';
import { DiffElement } from './DiffElement';

export class BranchesElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #commitsBox: CommitsElement;

  readonly #branchesBox: BranchesListElement;

  readonly #popupBox: PopupElement;

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
      width: '30%',
      bottom: 0,
      parent: this.#box,
    });
    this.#commitsBox = new CommitsElement({
      git,
      right: 0,
      top: 1,
      width: '70%-1',
      bottom: 0,
      parent: this.#box,
    });
    this.#popupBox = new PopupElement({
      git, width: '95%', height: '95%', label: 'Diff',
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
    }, async (branch, isInitial) => {
      await this.#commitsBox.switchBranch(branch);
      if (!isInitial) {
        await this.#commitsBox.onEnter();
      }
      this.#box.screen.render();
    });
    this.#commitsBox.logsList.on('select', async (item: any, index: number) => {
      this.#popupBox.show(this.#box, this.#commitsBox.logsList);
      const commitSha = this.#commitsBox.getCommitShaByIndex(index);
      const diff = await this.#git.getCommitDiff(commitSha || '');
      const diffBox = new DiffElement({
        git: this.#git, top: 0, left: 0, bottom: 0, right: 0, border: null,
      });
      diffBox.setContent(diff);
      this.#popupBox.addChild(diffBox.instance);
      this.#box.screen.render();
    });
  }

  override async onEnter(): Promise<void> {
    await this.#branchesBox.onEnter();
  }
}
