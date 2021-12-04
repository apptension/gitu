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
    return this.#git.stashList({
      format: {
        hash: '%H',
        date: '%aI',
        message: '%gs',
        refs: '%D',
        body: '%b',
        author_name: '%an',
        author_email: '%ae',
      },
    } as any);
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

  async renameStash(index: number, newName: string) {
    const dropResult = await this.#git.raw('stash', 'drop', `stash@{${index}}`);
    const match = dropResult.match(/\(([0-9a-f]*)\)/m);
    const stashSha = match?.[1];
    await this.#git.raw('stash', 'store', '-m', `${newName}`, `${stashSha}`);
  }
}
