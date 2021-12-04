import blessed, { Widgets } from 'blessed';
import contrib from 'blessed-contrib';
import { Git } from '../services/git';
import { Box, BoxConfig } from './Box';

export class StashBox implements Box {
  #box: Widgets.BoxElement | null = null;

  #screen: Widgets.Screen | null | undefined = null;

  get instance() {
    return this.#box;
  }

  build(config: BoxConfig) {
    this.#box = blessed.box({
      ...(config ?? {}),
      border: 'line',
      label: 'Stash',
    });
  }

  createStashListBox() : contrib.Widgets.TableElement {
    return contrib.table({
      parent: this.instance,
      top: 1,
      bottom: 0,
      width: '30%',
      columnWidth: [30],
      label: 'List',
      border: { type: 'line' },
      keys: true,
    });
  }

  createFilesModifiedBox() : contrib.Widgets.TableElement {
    return contrib.table({
      parent: this.instance,
      left: '30%',
      top: 1,
      bottom: 0,
      width: '70%',
      columnWidth: [30],
      label: 'Files modified',
      border: { type: 'line' },
      interactive: false as any,
    });
  }

  handleStashSelect(git: Git, filesModifiedBox: contrib.Widgets.TableElement) {
    return async (item: any, index: number) => {
      const files = await git.getModifiedFilesFromStash(index);
      await filesModifiedBox.setData({ headers: [''], data: files.map((file) => [file]) });
      filesModifiedBox.screen.render();
    };
  }

  async postInit() {
    const git = new Git();
    const stashList = await git.stashList();

    const stashListBox = this.createStashListBox();
    const filesModifiedBox = this.createFilesModifiedBox();

    (stashListBox as any).rows.on('select item', this.handleStashSelect(git, filesModifiedBox));

    stashListBox.setData({ headers: [''], data: stashList.all.map((stashItem) => [stashItem.message]) });
    stashListBox.focus();
  }
}
