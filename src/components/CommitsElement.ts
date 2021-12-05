import blessed, { Widgets } from 'blessed';
import { DefaultLogFields, LogResult } from 'simple-git';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';

export class CommitsElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #logsList: Widgets.ListElement;

  readonly #git: Git;

  #log : LogResult<DefaultLogFields> | null = null;

  get instance() {
    return this.#box;
  }

  get logsList() {
    return this.#logsList;
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
      style: {
        item: {
          fg: 'blue',
          hover: {
            fg: 'white',
            bg: 'black',
          },
        },
        selected: {
          fg: 'white',
          bg: 'black',
        },
      },
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
  }
}
