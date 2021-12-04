import blessed, { Widgets } from 'blessed';

import { createMainMenu } from './components/mainMenu';
import { Git } from './services/git';

const screen = blessed.screen();

const git: Git = new Git();

let currentElement: Widgets.BoxElement | null = null;

const wrapper = blessed.box({
  parent: screen,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
});

const mainMenu = createMainMenu(wrapper, git, async (element) => {
  currentElement?.detach();
  currentElement = element.instance;
  wrapper.append(currentElement);
  await element.init();
  screen.render();
});

screen.key(['q', 'C-c'], () => process.exit(0));
screen.key(['escape'], () => {
  mainMenu.focus();
});

screen.render();
