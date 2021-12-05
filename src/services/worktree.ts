import { readdir } from 'fs/promises';
import { resolve, relative, isAbsolute } from 'path';

import { Git } from './git';

export enum WorkTreeItemType {
  FILE,
  DIRECTORY,
  UPPER,
}

export interface WorkTreeItem {
  name: string;
  type: WorkTreeItemType
}

export class WorkTree {
  #git: Git;

  #trackedFiles: string[] = [];

  #rootPath: string = resolve('.');

  #currentPath: string = '';

  readonly #upperFolderItem: WorkTreeItem = {
    name: '..',
    type: WorkTreeItemType.UPPER
  };

  constructor(git: Git) {
    this.#git = git;
  }

  async init() {
    this.#trackedFiles = await this.#git.getTrackedFiles();
  }

  async getDataForCurrentPath(): Promise<WorkTreeItem[]> {
    const currentPath = resolve(this.#rootPath, this.#currentPath);
    const result = await readdir(currentPath, {
      withFileTypes: true,
    });
    const tree = result.map((file) => ({
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
    return this.#currentPath ? [this.#upperFolderItem, ...tree] : tree;
  }

  enterFolder(path: string) {
    const newPath = resolve(this.#rootPath, this.#currentPath, path);
    this.#currentPath = WorkTree.#calculateRelativePathSecured(this.#rootPath, newPath);
  }

  static #calculateRelativePathSecured(from: string, to: string) {
    const relativePath = relative(from, to);
    if (relativePath && !relativePath.startsWith('..') && !isAbsolute(relativePath)) {
      return relativePath;
    }

    return '';
  }
}
