import blessed, { Widgets } from 'blessed';
import contrib from 'blessed-contrib';

import { createMainMenu } from './components/mainMenu';
import BoxElement = Widgets.BoxElement;

const screen = blessed.screen();

let currentBox: BoxElement | null = null;

const wrapper = blessed.box({
  parent: screen,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0
});

const mainMenu = createMainMenu(wrapper, (boxCreator) => {
  currentBox?.detach();
  const box = boxCreator();
  box.focus();
  wrapper.append(box);
});


screen.key(['q', 'C-c'], function (ch, key) {
  return process.exit(0);
});
screen.key(['escape'], function (ch, key) {
  mainMenu.focus();
});

screen.render();
