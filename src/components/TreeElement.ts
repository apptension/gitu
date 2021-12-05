import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';
import { WorkTree, WorkTreeItem, WorkTreeItemType } from '../services/worktree';

export class TreeElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #treeList: Widgets.ListElement;

  readonly #git: Git;

  readonly #worktree: WorkTree;

  #currentItems: WorkTreeItem[] = [];

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
    await this.loadData();
    this.#treeList.key(['tab'], () => onTab?.());
    this.#treeList.on('select', async (_, index) => {
      if (this.#currentItems[index]) {
        if (this.#currentItems[index].type !== WorkTreeItemType.FILE) {
          this.#worktree.enterFolder(this.#currentItems[index].name);
          await this.loadData();
          this.#box.screen.render();
        }
      }
    });
  }

  override async onEnter(): Promise<void> {
    this.#treeList.focus();
  }

  async loadData() {
    this.#currentItems = await this.#worktree.getDataForCurrentPath();
    this.#treeList.clearItems();
    this.#currentItems.forEach((item) => {
      this.#treeList.addItem(item.name);
    });
  }
}
