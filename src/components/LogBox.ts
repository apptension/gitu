import blessed, { Widgets } from 'blessed';
import { Box, BoxConfig } from './Box';
import { Git } from '../services/git';

export class LogBox implements Box {
  #box: Widgets.BoxElement | null = null;

  #logsList: Widgets.ListElement | null = null;

  #git: Git | null = null;

  get instance() {
    return this.#box;
  }

  build(config: BoxConfig) {
    this.#box = blessed.box({
      ...(config ?? {}),
      border: 'line',
      label: 'Log',
    });
    this.#logsList = blessed.list({
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      parent: this.#box,
      keys: true,
      mouse: true,
      interactive: true,
    });
    this.#git = new Git();
  }

  async postInit(): Promise<void> {
    const log = await this.#git!.log();
    log.all.forEach((logLine) => {
      this.#logsList!.addItem(logLine.message);
    });
    this.#logsList!.focus();
  }
}
