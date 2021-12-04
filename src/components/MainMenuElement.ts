import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { WorktreeElement } from './WorktreeElement';
import { BranchesElement } from './BranchesElement';
import { StashElement } from './StashElement';
import { Git } from '../services/git';

type MenuSelectCallback = (selectedElement: Element) => Promise<void>;

export class MainMenuElement extends Element {
  readonly #listbar: Widgets.ListbarElement;

  readonly #git: Git;

  get instance() {
    return this.#listbar;
  }

  constructor({ git, ...config }: ElementConfig, onMenuSelect: MenuSelectCallback) {
    super();

    this.#git = git;
    this.#listbar = blessed.listbar({
      ...config,
      keys: true,
      mouse: true,
      autoCommandKeys: true,
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
        focus: {
          bg: 'red',
        },
      } as any,
      items: [],
      commands: [],
    });

    this.#createMenuItems(onMenuSelect);
  }

  #createMenuItems(onMenuSelect: MenuSelectCallback) {
    const elementsConfig: ElementConfig = {
      git: this.#git,
      left: 0,
      right: 0,
      top: 1,
      bottom: 0,
    };
    const items = [{
      name: 'Worktree',
      element: new WorktreeElement(elementsConfig),
    }, {
      name: 'Branches',
      element: new BranchesElement(elementsConfig),
    }, {
      name: 'Stash',
      element: new StashElement(elementsConfig),
    }];

    items.forEach((item) => {
      item.element.init().then(() => {
        item.element.instance.screen.render();
      });
      this.#listbar.addItem(item.name as any, async () => {
        await onMenuSelect(item.element);
      });
    });
  }

  override async init(): Promise<void> {
    this.#listbar.selectTab(0);
  }
}
