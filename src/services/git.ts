import simpleGit, { BranchSummary, LogResult, SimpleGit } from 'simple-git';

export class Git {
  #git: SimpleGit;

  constructor() {
    this.#git = simpleGit({
      baseDir: process.cwd(),
      binary: 'git',
      maxConcurrentProcesses: 6,
    });
  }

  async log(branch = 'HEAD'): Promise<LogResult> {
    return this.#git.log([branch]);
  }

  async logBetweenBranches(source: string, target:string) {
    return this.#git.log({ from: source, to: target });
  }

  async branches(): Promise<BranchSummary> {
    return this.#git.branch();
  }

  async currentBranchName(): Promise<string> {
    const branches = await this.branches();
    return branches.current;
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

  addColorsToGiff(diff: string) : string {
    const lines = diff.split('\n');
    let finalDiff = '';
    lines.forEach((line) => {
      if (line.startsWith('+')) {
        finalDiff += `{green-fg}${line}{/}\n`;
      } else if (line.startsWith('-')) {
        finalDiff += `{red-fg}${line}{/}\n`;
      } else {
        finalDiff += `${line}\n`;
      }
    });
    return finalDiff;
  }

  async getStashDiff(index: number) {
    const result = await this.#git.raw('stash', 'show', `stash@{${index}}`, '-p');
    return this.addColorsToGiff(result);
  }

  async getCommitDiff(sha: string) {
    const result = await this.#git.show(sha);
    return this.addColorsToGiff(result);
  }

  async getFileDiff(file: string, cached: boolean) {
    const baseOptions = cached ? ['--cached'] : [];
    const result = await this.#git.diff([...baseOptions, file]);
    return this.addColorsToGiff(result);
  }

  async renameStash(index: number, newName: string) {
    const dropResult = await this.#git.raw('stash', 'drop', `stash@{${index}}`);
    const match = dropResult.match(/\(([0-9a-f]*)\)/m);
    const stashSha = match?.[1];
    await this.#git.raw('stash', 'store', '-m', `${newName}`, `${stashSha}`);
  }

  async dropStash(index: number) {
    await this.#git.raw('stash', 'drop', `stash@{${index}}`);
  }

  async applyStash(index: number) {
    await this.#git.raw('stash', 'apply', `stash@{${index}}`);
  }

  async getTrackedFiles(): Promise<string[]> {
    const lsFilesResponse = await this.#git.raw('ls-files');
    return lsFilesResponse.split('\n').filter((file) => file);
  }

  async getStatus() {
    return this.#git.status();
  }
}
