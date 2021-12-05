import blessed, { Widgets } from 'blessed';

import { MainMenuElement } from './components/MainMenuElement';
import { Git } from './services/git';
import BlessedElement = Widgets.BlessedElement;

const screen = blessed.screen();

const git: Git = new Git();

let currentElement: BlessedElement | null = null;

const wrapper = blessed.box({
  parent: screen,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
});

const mainMenu = new MainMenuElement({
  git,
  parent: wrapper,
  top: 0,
  left: 0,
  right: 0,
  height: 1,
}, async (element) => {
  currentElement?.detach();
  currentElement = element.instance;
  wrapper.append(currentElement);
  await element.onEnter();
  screen.render();
});

screen.key(['q', 'C-c'], () => process.exit(0));
screen.key(['escape'], () => {
  mainMenu.instance.focus();
});

mainMenu.init().then(() => {
  screen.render();
});
