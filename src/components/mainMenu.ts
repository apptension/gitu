import blessed, { Widgets } from 'blessed';
import { createWorktreeBox } from './worktreeBox';
import { createBranchesBox } from './branchesBox';
import { createStashBox } from './stashBox';
import { BlockCreator } from './types';

export const createMainMenu = (wrapper: Widgets.BoxElement, switchBlocks: (blockCreator: BlockCreator) => void) => {
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
          bg: 'black'
        }
      },
      selected: {
        fg: 'white',
        bg: 'black'
      }
    },
    items: [],
    commands: []
  });
  mainMenu.focus()

  const items = [{
    name: 'Worktree',
    boxCreator: createWorktreeBox,
  }, {
    name: 'Branches',
    boxCreator: createBranchesBox,
  }, {
    name: 'Stash',
    boxCreator: createStashBox,
  }]

  items.forEach((item) => {
    mainMenu.addItem(item.name as any, () => {
      switchBlocks(item.boxCreator)
    });
  })

  return mainMenu;
}
