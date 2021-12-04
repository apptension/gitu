import blessed from 'blessed';
import { BlockCreator, Position } from './types';

export const createWorktreeBox: BlockCreator = async (position?: Position) => blessed.box({
  left: position?.left,
  right: position?.right,
  top: position?.top,
  bottom: position?.bottom,
  border: 'line',
  label: 'Worktree',
});
