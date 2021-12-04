import blessed, { Widgets } from 'blessed';
import { Element, ElementConfig } from './Element';
import { WorktreeElement } from './WorktreeElement';
import { BranchesElement } from './BranchesElement';
import { StashElement } from './StashElement';
import { Git } from '../services/git';

type MenuSelectCallback = (selectedElement: Element) => Promise<void>;

export const createMainMenu = (wrapper: Widgets.BoxElement, git: Git, onMenuSelect: MenuSelectCallback) => {
  const mainMenu = blessed.listbar({
    parent: wrapper,
    top: 0,
    left: 0,
    right: 0,
    height: 1,
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
    },
    items: [],
    commands: [],
  });
  mainMenu.focus();

  const elementsConfig: ElementConfig = {
    git,
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
    mainMenu.addItem(item.name as any, async () => {
      await onMenuSelect(item.element);
    });
  });

  mainMenu.selectTab(0);

  return mainMenu;
};
