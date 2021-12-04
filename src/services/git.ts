import simpleGit, { SimpleGit } from 'simple-git';

export class Git {
  #git: SimpleGit;

  constructor() {
    this.#git = simpleGit({
      baseDir: process.cwd(),
      binary: 'git',
      maxConcurrentProcesses: 6,
    });
  }

  async log() {
    return this.#git.log();
  }

  async stashList() {
    return this.#git.stashList();
  }

  async getModifiedFilesFromStash(index: number) {
    const result = await this.#git.raw('stash', 'show', `stash@{${index}}`);
    const lines = result.split('\n');
    const files = [];
    for (let i = 0; i < lines.length - 2; i += 1) {
      files.push(lines[i].split('|')[0].trim());
    }
    return files;
  }
}
