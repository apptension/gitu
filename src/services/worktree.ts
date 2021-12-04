import { readdir } from 'fs/promises';

import { Git } from './git';

enum WorkTreeItemType {
  FILE,
  DIRECTORY,
}

export interface WorkTreeItem {
  name: string;
  type: WorkTreeItemType
}

export class WorkTree {
  #git: Git;

  #trackedFiles: string[] = [];

  constructor(git: Git) {
    this.#git = git;
  }

  async init() {
    this.#trackedFiles = await this.#git.getTrackedFiles();
  }

  async getFor(path: string): Promise<WorkTreeItem[]> {
    const result = await readdir(path, {
      withFileTypes: true,
    });
    return result.map((file) => ({
      name: file.name,
      type: file.isDirectory() ? WorkTreeItemType.DIRECTORY : WorkTreeItemType.FILE,
    })).sort((fileA, fileB) => {
      if (fileA.type === WorkTreeItemType.DIRECTORY && fileB.type === WorkTreeItemType.FILE) {
        return -1;
      }
      if (fileA.type === WorkTreeItemType.FILE && fileB.type === WorkTreeItemType.DIRECTORY) {
        return 1;
      }
      return fileA.name.localeCompare(fileB.name);
    });
  }
}
