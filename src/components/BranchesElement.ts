import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';

export class BranchesElement extends Element {
  readonly #box: Widgets.BoxElement;

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
    this.applyBorderStyleForFocusedElement();
  }
}
