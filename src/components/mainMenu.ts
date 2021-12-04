import blessed, { Widgets } from 'blessed';
import { Box } from './Box';
import { WorktreeBox } from './worktreeBox';
import { BranchesBox } from './branchesBox';
import { StashBox } from './stashBox';

type SwitchBoxCallback = (boxClass: { new(...args: any[]): Box }) => Promise<void>;

export const createMainMenu = (wrapper: Widgets.BoxElement, switchBoxes: SwitchBoxCallback) => {
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

  const items = [{
    name: 'Worktree',
    box: WorktreeBox,
  }, {
    name: 'Branches',
    box: BranchesBox,
  }, {
    name: 'Stash',
    box: StashBox,
  }];

  items.forEach((item) => {
    mainMenu.addItem(item.name as any, () => {
      switchBoxes(item.box);
    });
  });

  return mainMenu;
};
