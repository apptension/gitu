import blessed, { Widgets } from 'blessed';
import { Git } from '../services/git';
import { Box } from './Box';
import BoxOptions = Widgets.BoxOptions;

export class StashBox implements Box {
  #box: Widgets.BoxElement | null = null;

  get instance() {
    return this.#box;
  }

  build(config: BoxOptions) {
    this.#box = blessed.box({
      ...(config ?? {}),
      border: 'line',
      label: 'Stash',
    });
  }

  async postInit() {
    const git = new Git();
    const stashList = await git.stashList();
    console.log(stashList);
  }
}
