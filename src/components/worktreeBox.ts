import blessed, { Widgets } from 'blessed';
import { Position } from './types';
import { Box } from './Box';

export class WorktreeBox extends Box {
  build(position?: Position): Widgets.BoxElement {
    return blessed.box({
      left: position?.left,
      right: position?.right,
      top: position?.top,
      bottom: position?.bottom,
      border: 'line',
      label: 'Worktree',
    });
  }
}
