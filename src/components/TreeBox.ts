import blessed, { Widgets } from 'blessed';
import { Box, BoxConfig } from './Box';

export class TreeBox implements Box {
  #box: Widgets.BoxElement | null = null;

  get instance() {
    return this.#box;
  }

  build(config: BoxConfig) {
    this.#box = blessed.box({
      ...(config ?? {}),
      border: 'line',
      label: 'Tree',
    });
  }
}
