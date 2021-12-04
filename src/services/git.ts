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
    return this.#git.log()
  }

  async stashList() {
    return this.#git.stashList();
  }
}
