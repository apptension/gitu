export class Changelog {
  static generateChangelogHeader() : string {
    return '# Changelog\n## [Unreleased]\n';
  }

  static isCommitBugFix(commit: string) : boolean {
    return /bug|fix/.test(commit);
  }

  static generateChangelogSection(sectionName: string, commits: string[]) : string {
    let sectionContent = '';
    if (commits.length) {
      sectionContent += `### ${sectionName}\n`;
      commits.forEach((commit) => {
        sectionContent += `- ${commit}\n`;
      });
    }
    return sectionContent;
  }

  static generate(commits: string[]): string {
    const changed : string[] = [];
    const fixed : string[] = [];

    let changelog = this.generateChangelogHeader();

    commits.forEach((commit) => {
      if (this.isCommitBugFix(commit)) {
        fixed.push(commit);
      } else {
        changed.push(commit);
      }
    });

    changelog += this.generateChangelogSection('Changed', changed);
    changelog += this.generateChangelogSection('Fixed', fixed);

    return changelog;
  }
}
