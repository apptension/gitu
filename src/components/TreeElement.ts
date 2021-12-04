import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';
import { WorkTree } from '../services/worktree';

export class TreeElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #treeList: Widgets.ListElement;

  readonly #git: Git;

  readonly #worktree: WorkTree;

  get instance() {
    return this.#box;
  }

  constructor({ git, ...config }: ElementConfig) {
    super();

    this.#git = git;
    this.#worktree = new WorkTree(git);
    this.#box = blessed.box({
      ...(config ?? {}),
      border: 'line',
      label: 'Tree',
    });
    this.#treeList = blessed.list({
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
    this.applyBorderStyleForFocusedElement(this.#treeList, this.#box);
  }

  override async init(onTab?: () => void): Promise<void> {
    await this.#worktree.init();
    const items = await this.#worktree.getFor('.');
    items.forEach((item) => {
      this.#treeList.addItem(item.name);
    });
    this.#treeList.key(['tab'], () => onTab?.());
  }

  override async onEnter(): Promise<void> {
    this.#treeList.focus();
  }
}
