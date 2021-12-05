import { readdir } from 'fs/promises';
import {
  resolve, relative, isAbsolute, sep,
} from 'path';
import { FileStatusResult, StatusResult } from 'simple-git';
import { StatusSummary } from 'simple-git/src/lib/responses/StatusSummary';

import { Git } from './git';

export enum WorkTreeItemType {
  FILE,
  DIRECTORY,
  UPPER,
}

export enum WorkTreeItemStatus {
  NONE,
  IGNORED,
  UNMODIFIED,
  UNTRACKED,
  MODIFIED,
  ADDED,
  DELETED,
  CONFLICTED,
}

export interface WorkTreeItem {
  name: string;
  type: WorkTreeItemType;
  indexStatus: WorkTreeItemStatus;
  workdirStatus: WorkTreeItemStatus;
}

export class WorkTree {
  #git: Git;

  #trackedFiles: string[] = [];

  #gitStatus: StatusResult = new StatusSummary();

  #rootPath: string = resolve('.');

  #currentPath: string = '';

  readonly #upperFolderItem: WorkTreeItem = {
    name: '..',
    type: WorkTreeItemType.UPPER,
    indexStatus: WorkTreeItemStatus.NONE,
    workdirStatus: WorkTreeItemStatus.NONE,
  };

  constructor(git: Git) {
    this.#git = git;
  }

  async init() {
    this.#trackedFiles = await this.#git.getTrackedFiles();
    this.#gitStatus = await this.#git.getStatus();
  }

  async getDataForCurrentPath(): Promise<WorkTreeItem[]> {
    let files = await this.#getFilesFromCurrentPath();
    files = this.#addDeletedFiles(files);
    files = this.#sortFiles(files);
    files = this.#attachStatus(files);
    return this.#attachUpperFolderIndicator(files);
  }

  async #getFilesFromCurrentPath(): Promise<WorkTreeItem[]> {
    const currentPath = resolve(this.#rootPath, this.#currentPath);
    const result = await readdir(currentPath, {
      withFileTypes: true,
    }).catch(() => []);
    return result.map((file) => ({
      name: file.name,
      type: file.isDirectory() ? WorkTreeItemType.DIRECTORY : WorkTreeItemType.FILE,
      indexStatus: WorkTreeItemStatus.NONE,
      workdirStatus: WorkTreeItemStatus.NONE,
    }));
  }

  #addDeletedFiles(files: WorkTreeItem[]): WorkTreeItem[] {
    const foundFiles = files.map((file) => file.name);
    const trackedFilesFromCurrentPath = this.#trackedFiles
      .filter((file) => file.startsWith(this.#currentPath))
      .map((file) => relative(this.#currentPath, file));
    const trackedFilesNotFoundInFS = trackedFilesFromCurrentPath.filter((file) => {
      const firstSegment = file.split(sep)[0];
      return !foundFiles.includes(firstSegment);
    });
    const deletedEntriesMap: { [key: string]: WorkTreeItem } = trackedFilesNotFoundInFS.reduce((acc, file) => {
      const segments = file.split(sep);
      if (!segments[0] || acc[segments[0]]) {
        return acc;
      }
      return {
        ...acc,
        [segments[0]]: {
          name: segments[0],
          type: segments.length > 1 ? WorkTreeItemType.DIRECTORY : WorkTreeItemType.FILE,
          indexStatus: WorkTreeItemStatus.NONE,
          workdirStatus: WorkTreeItemStatus.NONE,
        },
      };
    }, {} as { [key: string]: WorkTreeItem });
    return [...files, ...Object.values(deletedEntriesMap)];
  }

  #sortFiles(files: WorkTreeItem[]): WorkTreeItem[] {
    return files.sort((fileA, fileB) => {
      if (fileA.type === WorkTreeItemType.DIRECTORY && fileB.type === WorkTreeItemType.FILE) {
        return -1;
      }
      if (fileA.type === WorkTreeItemType.FILE && fileB.type === WorkTreeItemType.DIRECTORY) {
        return 1;
      }
      return fileA.name.localeCompare(fileB.name);
    });
  }

  #attachUpperFolderIndicator(files: WorkTreeItem[]): WorkTreeItem[] {
    return this.#currentPath ? [this.#upperFolderItem, ...files] : files;
  }

  #attachStatus(files: WorkTreeItem[]): WorkTreeItem[] {
    const statusMap: { [key: string]: FileStatusResult } = this.#gitStatus.files.reduce(
      (map, fileStatus) => ({ ...map, [fileStatus.path]: fileStatus }),
      {},
    );
    return files.map((file) => {
      const currentPath = this.#currentPath ? `${this.#currentPath}${sep}` : '';
      const relativeFilePath = `${currentPath}${file.name}`;
      const status = statusMap[relativeFilePath];
      const isCurrentPathTracked = this.#trackedFiles.includes(relativeFilePath);
      if (file.type === WorkTreeItemType.FILE) {
        const mapped = { ...file };
        if (!status) {
          mapped.workdirStatus = isCurrentPathTracked ? WorkTreeItemStatus.UNMODIFIED : WorkTreeItemStatus.IGNORED;
        } else if (!isCurrentPathTracked) {
          mapped.workdirStatus = WorkTreeItemStatus.UNTRACKED;
        } else {
          // eslint-disable-next-line default-case
          switch (status.working_dir) {
            case 'M':
              mapped.workdirStatus = WorkTreeItemStatus.MODIFIED;
              break;
            case 'D':
              mapped.workdirStatus = WorkTreeItemStatus.DELETED;
              break;
            case 'A':
              mapped.workdirStatus = WorkTreeItemStatus.ADDED;
              break;
            case 'U':
              mapped.workdirStatus = WorkTreeItemStatus.CONFLICTED;
              break;
          }
          // eslint-disable-next-line default-case
          switch (status.index) {
            case 'M':
              mapped.indexStatus = WorkTreeItemStatus.MODIFIED;
              break;
            case 'D':
              mapped.indexStatus = WorkTreeItemStatus.DELETED;
              break;
            case 'A':
              mapped.indexStatus = WorkTreeItemStatus.ADDED;
              break;
          }
        }

        return mapped;
      }
      return file;
    });
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

  static convertStatusToText(status: WorkTreeItemStatus): string {
    switch (status) {
      case WorkTreeItemStatus.IGNORED:
        return 'I';
      case WorkTreeItemStatus.MODIFIED:
        return 'M';
      case WorkTreeItemStatus.ADDED:
        return 'A';
      case WorkTreeItemStatus.DELETED:
        return 'D';
      case WorkTreeItemStatus.CONFLICTED:
        return 'C';
      case WorkTreeItemStatus.UNTRACKED:
        return '?';
      default:
        return '';
    }
  }
}
