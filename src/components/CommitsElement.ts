import blessed, { Widgets } from 'blessed';
import { DefaultLogFields, LogResult } from 'simple-git';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';
import { DefaultTheme } from '../themes/default';

export class CommitsElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #logsList: Widgets.ListElement;

  readonly #git: Git;

  #log : LogResult<DefaultLogFields> | null = null;

  #selectedCommits : number[] = [];

  get instance() {
    return this.#box;
  }

  get logsList() {
    return this.#logsList;
  }

  get selectedCommits() : string[] {
    return this.#selectedCommits.map((index) => this.#log?.all[index].message || '');
  }

  toggleCommit(index: number) {
    const item = this.#logsList.getItem(index);

    if (!this.#selectedCommits.includes(index)) {
      this.#selectedCommits.push(index);
      item.style.bg = 'grey';
    } else {
      const i = this.#selectedCommits.indexOf(index);
      this.#selectedCommits.splice(i, 1);
      item.style.bg = 'transparent';
    }
  }

  constructor({ git, ...config }: ElementConfig) {
    super();

    this.#git = git;
    this.#box = blessed.box({
      ...config,
      border: 'line',
      label: 'Commits',
    });
    this.#logsList = blessed.list({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      parent: this.#box,
      keys: true,
      mouse: true,
      style: DefaultTheme.listStyle,
      tags: true,
    });
    this.applyBorderStyleForFocusedElement(this.#logsList, this.#box);
  }

  override async init(onTab?: () => void): Promise<void> {
    this.#logsList.key(['tab'], () => onTab?.());
  }

  override async onEnter(): Promise<void> {
    this.#logsList.focus();
  }

  getCommitShaByIndex(index: number) {
    return this.#log?.all[index].hash;
  }

  clear() {
    this.#logsList.clearItems();
    this.#selectedCommits = [];
    this.#box.setLabel('Commits');
  }

  showCommits() {
    this.#logsList.clearItems();
    this.#log?.all.forEach((logLine) => {
      this.#logsList.addItem(logLine.message);
    });
  }

  async switchBranch(branch: string) {
    this.#box.setLabel(`Commits - ${branch}`);
    this.#log = await this.#git.log(branch);
    this.showCommits();
  }

  async showDiffBetweenBranches(source: string, target: string) {
    this.#box.setLabel(`Commits - ${source} vs ${target}`);
    this.#log = await this.#git.logBetweenBranches(source, target);
    this.showCommits();
    this.#selectedCommits = [];
    for (let i = 0; i < this.#log.all.length; i += 1) {
      this.toggleCommit(i);
    }
  }
}
