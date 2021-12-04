import blessed, { Widgets } from 'blessed';
import { Box } from './Box';
import BoxOptions = Widgets.BoxOptions;

export class BranchesBox implements Box {
  #box: Widgets.BoxElement | null = null;

  get instance() {
    return this.#box;
  }

  build(config: BoxOptions) {
    this.#box = blessed.box({
      ...(config ?? {}),
      border: 'line',
      label: 'Branches',
    });
  }
}
