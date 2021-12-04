import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { LogElement } from './LogElement';
import { TreeElement } from './TreeElement';
import { Git } from '../services/git';

export class WorktreeElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #logBox: LogElement;

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
    });
    this.#logBox = new LogElement({
      git,
      left: 0,
      top: 0,
      width: '50%',
      bottom: 0,
      parent: this.#box,
    });
    this.#treeBox = new TreeElement({
      git,
      right: 0,
      top: 0,
      width: '50%',
      bottom: 0,
      parent: this.#box,
    });
  }

  override async init(): Promise<void> {
    await this.#logBox.init();
    await this.#treeBox.init();
  }

  override async onEnter(): Promise<void> {
    return this.#logBox.onEnter();
  }
}
