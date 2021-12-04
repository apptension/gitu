import blessed, { Widgets } from 'blessed';

import { createMainMenu } from './components/mainMenu';
import BoxElement = Widgets.BoxElement;

const screen = blessed.screen();

let currentBox: BoxElement | null = null;

const wrapper = blessed.box({
  parent: screen,
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
});

const mainMenu = createMainMenu(wrapper, async (box) => {
  currentBox?.detach();
  box.build({
    left: 0, top: 1, right: 0, bottom: 0,
  });
  currentBox = box.instance;
  if (currentBox) {
    currentBox.focus();
    wrapper.append(currentBox);
  }
  await box.postInit?.();
  screen.render();
});

screen.key(['q', 'C-c'], () => process.exit(0));
screen.key(['escape'], () => {
  mainMenu.focus();
});

screen.render();
