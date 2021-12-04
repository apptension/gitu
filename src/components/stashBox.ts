import blessed, { Widgets } from 'blessed';
import { Position } from './types';
import { Git } from '../services/git';
import { Box } from './Box';

export class StashBox extends Box {
  build(position?: Position): Widgets.BoxElement {
    return blessed.box({
      left: position?.left,
      right: position?.right,
      top: position?.top,
      bottom: position?.bottom,
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
