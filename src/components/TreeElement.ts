import blessed, { Widgets } from 'blessed';
import contrib, { Widgets as ContribWidgets } from 'blessed-contrib';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';
import { WorkTree, WorkTreeItem, WorkTreeItemType } from '../services/worktree';

export class TreeElement extends Element {
  readonly #box: Widgets.BoxElement;

  readonly #treeTable: ContribWidgets.TableElement;

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
    this.#treeTable = contrib.table({
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
      columnSpacing: 2,
      columnWidth: [1, 1, 80],
    });
    this.applyBorderStyleForFocusedElement(this.#treeTable, this.#box);
  }

  override async init(onTab?: () => void): Promise<void> {
    await this.#worktree.init();
    await this.loadData();
    this.#treeTable.key(['tab'], () => onTab?.());
    this.#rows.on('select', async (_, index) => {
      if (this.#currentItems[index]) {
        if (this.#currentItems[index].type !== WorkTreeItemType.FILE) {
          this.#worktree.enterFolder(this.#currentItems[index].name);
          await this.loadData();
          this.#box.screen.render();
        }
      }
    });
  }

  get #rows(): Widgets.ListElement {
    return (this.#treeTable as any).rows as Widgets.ListElement;
  }

  override async onEnter(): Promise<void> {
    this.#treeTable.focus();
  }

  async loadData() {
    this.#currentItems = await this.#worktree.getDataForCurrentPath();
    this.#treeTable.setData({
      headers: [],
      data: this.#currentItems.map((item) => [
        WorkTree.convertStatusToText(item.indexStatus),
        WorkTree.convertStatusToText(item.workdirStatus),
        item.type === WorkTreeItemType.FILE ? item.name : `» ${item.name}`,
      ]),
    });
    this.#treeTable.setContent('');
    this.#rows.top = 0;
    this.#box.screen.render();
  }
}
