import blessed from 'blessed';
import { BlockCreator, Position } from './types';
import { Git } from '../services/git';

export const createStashBox: BlockCreator = async (position?: Position) => {
  const stashBox = blessed.box({
    left: position?.left,
    right: position?.right,
    top: position?.top,
    bottom: position?.bottom,
    border: 'line',
    label: 'Stash',
  });

  const git = new Git();
  const stashList = await git.stashList();
  console.log(stashList);

  return stashBox;
};
