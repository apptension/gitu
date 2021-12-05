import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';
import { DefaultTheme } from '../themes/default';

export class BranchesListElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #branchesList: Widgets.ListElement;

  readonly #git: Git;

  #currentBranch : string | null = null;

  get currentBranch() {
    return this.#currentBranch;
  }

  get instance() {
    return this.#box;
  }

  constructor({ git, ...config }: ElementConfig) {
    super();

    this.#git = git;
    this.#box = blessed.box({
      ...config,
      border: 'line',
    });
    this.#branchesList = blessed.list({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      parent: this.#box,
      keys: true,
      mouse: true,
      style: DefaultTheme.listStyle,
    });
    this.applyBorderStyleForFocusedElement(this.#branchesList, this.#box);
  }

  override async init(
    onTab?: () => void,
    onSelect?: (branch: string, isInitial: boolean) => void,
  ): Promise<void> {
    const branches = await this.#git.branches();
    const currentBranchIndex = branches.all.indexOf(branches.current);
    branches.all.forEach((branch) => {
      let name = branch;
      if (branch === branches.current && branches.detached) {
        name = `${branch} (detached)`;
      }
      this.#branchesList.addItem(name);
    });
    this.#branchesList.key(['tab'], () => onTab?.());
    this.#branchesList.on('select', (_, index) => {
      this.#currentBranch = branches.all[index];
      onSelect?.(this.#currentBranch, false);
    });
    this.#branchesList.select(currentBranchIndex);
    this.#currentBranch = branches.current;
    onSelect?.(branches.current, true);
  }

  override async onEnter(): Promise<void> {
    this.#branchesList.focus();
  }
}
