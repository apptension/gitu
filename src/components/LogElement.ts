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

  override async init(): Promise<void> {
    const log = await this.#git.log();
    log.all.forEach((logLine) => {
      this.#logsList.addItem(logLine.message);
    });
  }

  override async onEnter(): Promise<void> {
    this.#logsList.focus();
  }
}
