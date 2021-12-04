import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';

export class LogElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #logsList: Widgets.ListElement;

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
      label: 'Log',
    });
    this.#logsList = blessed.list({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      parent: this.#box,
      keys: true,
      mouse: true,
      interactive: true,
    });
  }

  override async init(): Promise<void> {
    const log = await this.#git.log();
    log.all.forEach((logLine) => {
      this.#logsList.addItem(logLine.message);
    });
    this.#logsList.focus();
  }
}
