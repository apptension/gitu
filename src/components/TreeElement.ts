import blessed, { Widgets } from 'blessed';
import contrib, { Widgets as ContribWidgets } from 'blessed-contrib';
import { Element, ElementConfig } from './Element';
import { Git } from '../services/git';
import {
  WorkTree,
  WorkTreeItem,
  WorkTreeItemStatus,
  WorkTreeItemType,
} from '../services/worktree';
import { DefaultTheme } from '../themes/default';

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
      columnSpacing: 2,
      columnWidth: [1, 1, 80],
    });
    this.#rows.style = {
      ...DefaultTheme.listStyle,
      item: {
        ...DefaultTheme.listStyle.item,
        fg: 'white',
      },
    };
    this.applyBorderStyleForFocusedElement(this.#rows, this.#box);
  }

  override async init(
    onTab?: () => void,
    onDiffFor?: (path: string, useNormal: boolean, useCached: boolean) => void,
  ): Promise<void> {
    await this.#worktree.init();
    await this.loadData();
    this.#rows.key(['tab'], () => onTab?.());
    this.#rows.on('select', async (_, index) => {
      if (this.#currentItems[index]) {
        const currentFile = this.#currentItems[index];
        if (currentFile.type === WorkTreeItemType.FILE) {
          const statusesWithNonEmptyDiff = [
            WorkTreeItemStatus.DELETED,
            WorkTreeItemStatus.ADDED,
            WorkTreeItemStatus.MODIFIED,
            WorkTreeItemStatus.CONFLICTED,
          ];
          const useNormal = statusesWithNonEmptyDiff.includes(currentFile.workdirStatus);
          const useCached = statusesWithNonEmptyDiff.includes(currentFile.indexStatus);
          if (useCached || useNormal) {
            onDiffFor?.(this.#worktree.getFullRelativePathToFile(currentFile.name), useNormal, useCached);
          }
        } else {
          const newFolderName = currentFile.name;
          const currentFolderName = this.#worktree.getCurrentFolderName();
          this.#worktree.enterFolder(newFolderName);
          await this.loadData();
          if (newFolderName === WorkTree.UPPER_FOLDER_NAME) {
            this.#rows.select(this.#currentItems.findIndex((item) => item.name === currentFolderName));
          } else {
            this.#rows.select(0);
          }

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
      data: this.#currentItems.map((item) => {
        const nameWithTags = WorkTree.applyStyleTags(item.name, item.styleTags);
        return [
          WorkTree.convertStatusToText(item.indexStatus),
          WorkTree.convertStatusToText(item.workdirStatus),
          item.type === WorkTreeItemType.FILE ? nameWithTags : `» ${nameWithTags}`,
        ];
      }),
    });
    this.#treeTable.setContent('');
    this.#rows.top = 0;
    this.#rows.select(0);
  }
}
