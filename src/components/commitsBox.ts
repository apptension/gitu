import blessed from 'blessed';
import { BlockCreator } from './types';

export const createCommitsBox: BlockCreator = () => {
  return blessed.box({
    left: 0,
    right: 0,
    top: 1,
    bottom: 0,
    border: 'line',
    label: 'Commits',
  });
};
