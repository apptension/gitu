import { readdir } from 'fs/promises';
import {
  resolve, relative, isAbsolute, sep, join
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
  styleTags: string[];
}

export class WorkTree {
  static readonly UPPER_FOLDER_NAME = '..';

  #git: Git;

  #trackedFiles: string[] = [];

  #gitStatus: StatusResult = new StatusSummary();

  #rootPath: string = resolve('.');

  #currentPath: string = '';

  readonly #upperFolderItem: WorkTreeItem = {
    name: WorkTree.UPPER_FOLDER_NAME,
    type: WorkTreeItemType.UPPER,
    indexStatus: WorkTreeItemStatus.NONE,
    workdirStatus: WorkTreeItemStatus.NONE,
    styleTags: [],
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
      styleTags: [],
    }));
  }

  #addDeletedFiles(files: WorkTreeItem[]): WorkTreeItem[] {
    const foundFiles = files.map((file) => file.name);
    const trackedFilesFromCurrentPath = this.#trackedFiles
      .filter((file) => file === this.#currentPath || file.startsWith(`${this.#currentPath}${sep}`))
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
          styleTags: [],
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
          mapped.styleTags = ['bold', 'red-fg'];
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
          if (mapped.indexStatus !== WorkTreeItemStatus.NONE && mapped.workdirStatus !== WorkTreeItemStatus.NONE) {
            mapped.styleTags = ['bold', 'yellow-fg'];
          } else if (mapped.indexStatus !== WorkTreeItemStatus.NONE) {
            mapped.styleTags = ['bold', 'green-fg'];
          } else if (mapped.workdirStatus !== WorkTreeItemStatus.NONE) {
            if (mapped.workdirStatus === WorkTreeItemStatus.CONFLICTED) {
              mapped.styleTags = ['bold', 'black-fg', 'red-bg'];
            } else {
              mapped.styleTags = ['bold', 'red-fg'];
            }
          }
        }

        return mapped;
      }
      if (file.type === WorkTreeItemType.DIRECTORY) {
        const mapped = { ...file };
        const fullRelativePath = this.getFullRelativePathToFile(file.name);
        const hasChangesInside = this.#gitStatus.files
          .some((statusFile) => statusFile.path.startsWith(`${fullRelativePath}${sep}`));
        if (hasChangesInside) {
          mapped.styleTags = ['bold', 'yellow-fg'];
        }
        return mapped;
      }
      return file;
    });
  }

  getCurrentFolderName() {
    const segments = this.#currentPath.split(sep);
    return segments[segments.length - 1];
  }

  enterFolder(path: string) {
    const newPath = resolve(this.#rootPath, this.#currentPath, path);
    this.#currentPath = WorkTree.#calculateRelativePathSecured(this.#rootPath, newPath);
  }

  getFullRelativePathToFile(file: string): string {
    return join(this.#currentPath, file);
  }

  static #calculateRelativePathSecured(from: string, to: string) {
    if (this.#isPathParent(from, to)) {
      return '';
    }
    return relative(from, to);
  }

  static #isPathParent(sourcePath: string, potentialParentPath: string): boolean {
    const relativePath = relative(sourcePath, potentialParentPath);
    return !relativePath || relativePath.startsWith(this.UPPER_FOLDER_NAME) || isAbsolute(relativePath);
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

  static applyStyleTags(text: string, tags: string[]): string {
    return tags.reduce((applied, tag) => `{${tag}}${applied}{/}\n`, text);
  }
}
