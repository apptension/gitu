import blessed, { Widgets } from 'blessed';
import { Box, BoxConfig } from './Box';
import { LogBox } from './LogBox';
import { TreeBox } from './TreeBox';

export class WorktreeBox implements Box {
  #logBox: LogBox | null = null;

  #treeBox: TreeBox | null = null;

  #box: Widgets.BoxElement | null = null;

  get instance() {
    return this.#box;
  }

  build(config: BoxConfig) {
    this.#box = blessed.box({
      ...(config ?? {}),
    });

    this.#logBox = new LogBox();
    this.#logBox.build({
      left: 0,
      top: 0,
      width: '50%',
      bottom: 0,
      parent: this.#box,
    });

    this.#treeBox = new TreeBox();
    this.#treeBox.build({
      right: 0,
      top: 0,
      width: '50%',
      bottom: 0,
      parent: this.#box,
    });
  }

  async postInit(): Promise<void> {
    this.#box!.focus();
    await this.#logBox!.postInit();
  }
}
