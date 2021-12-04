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

const mainMenu = createMainMenu(wrapper, async (boxCreator) => {
  currentBox?.detach();
  const box = await boxCreator({ left: 0, top: 1, right: 0, bottom: 0 });
  box.focus();
  wrapper.append(box);
  screen.render()
});


screen.key(['q', 'C-c'], function (ch, key) {
  return process.exit(0);
});
screen.key(['escape'], function (ch, key) {
  mainMenu.focus();
});

screen.render();
