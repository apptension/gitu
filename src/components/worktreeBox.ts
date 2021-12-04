import blessed, { Widgets } from 'blessed';
import { Box, BoxConfig } from './Box';
import { LogBox } from './LogBox';

export class WorktreeBox implements Box {
  #logBox: LogBox | null = null;

  #box: Widgets.BoxElement | null = null;

  get instance() {
    return this.#box;
  }

  build(config: BoxConfig) {
    this.#box = blessed.box({
      ...(config ?? {}),
      border: 'line',
      label: 'Worktree',
    });

    // this.#logBox = new LogBox({
    //   left: 0,
    //   top: 0,
    //   width: '50%',
    //   height: '100%',
    //   parent: box,
    // });
  }
}
