import blessed from 'blessed';
import { BlockCreator } from './types';
import { Git }  from './../services/git';
export const createStashBox: BlockCreator = async () => {
  const stashBox = blessed.box({
    left: 0,
    right: 0,
    top: 1,
    bottom: 0,
    border: 'line',
    label: 'Stash',
  });

  const git = new Git();
  const stashList = await git.stashList();
  console.log(stashList);

  return stashBox;
};
