import blessed, { Widgets } from 'blessed';
import * as fs from 'fs';
import { Git } from '../services/git';
import { Element, ElementConfig } from './Element';
import { BranchesListElement } from './BranchesListElement';
import { CommitsElement } from './CommitsElement';
import { PopupElement } from './PopupElement';

export class ChangelogElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #sourceBranchSelector: BranchesListElement;

  readonly #targetBranchSelector: BranchesListElement;

  readonly #commitsBox: CommitsElement;

  readonly #buttonBox: Widgets.ButtonElement;

  readonly #popup: PopupElement;

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
      height: '85%-1',
      parent: this.#box,
    });
    this.#buttonBox = blessed.button({
      left: '50%',
      right: 0,
      top: '85%',
      border: 'line',
      bottom: 0,
      valign: 'middle',
      align: 'center',
      content: 'Generate Changelog',
      bg: 'blue',
      mouse: true,
      parent: this.#box,
    });
    this.#popup = new PopupElement({ git, width: '35%', height: '20%' });
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

  generateChangelogSubmitHandler(value: string) {
    const { selectedCommits } = this.#commitsBox;
    if (selectedCommits) {
      let fileContent = '# Changelog\n## [Unreleased]\n### Changed\n';
      selectedCommits.forEach((commit) => {
        fileContent += `- ${commit}\n`;
      });
      fs.writeFileSync(value, fileContent);
    }

    this.#popup.hide();
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
      this.#buttonBox.focus();
      this.#box.screen.render();
    });
    this.#commitsBox.logsList.on('select', async (item: any, index: number) => {
      this.#commitsBox.toggleCommit(index);
      this.#box.screen.render();
    });

    this.#buttonBox.key(['tab'], () => {
      this.#sourceBranchSelector.onEnter();
      this.#box.screen.render();
    });
    this.applyBorderStyleForFocusedElement(this.#buttonBox, this.#buttonBox);
    this.#buttonBox.on('press', () => {
      if (this.#commitsBox.selectedCommits?.length) {
        this.#popup.show(this.#box, this.#buttonBox);
        this.#popup.renderTextInput(
          'Changelog path: ',
          this.generateChangelogSubmitHandler.bind(this),
          `${process.cwd()}/changelog.txt`,
        );
        this.#box.screen.render();
      }
    });
  }

  override async onEnter(): Promise<void> {
    await this.#sourceBranchSelector.onEnter();
    this.#box.screen.render();
  }
}
