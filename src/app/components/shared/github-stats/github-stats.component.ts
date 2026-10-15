import { Component, ChangeDetectionStrategy } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { GITHUB_STATS } from '../../../data/github-stats';
import { ScrollRevealDirective } from '../../../directives/scroll-reveal.directive';
import { CountUpDirective } from '../../../directives/count-up.directive';

/**
 * A small strip of real GitHub numbers, snapshotted at build time by
 * tools/fetch-github.cjs. Facts only: repo count, languages, last push.
 */
@Component({
    selector: 'app-github-stats',
    templateUrl: './github-stats.component.html',
    changeDetection: ChangeDetectionStrategy.Eager,
    imports: [TranslatePipe, ScrollRevealDirective, CountUpDirective]
})
export class GithubStatsComponent {
  readonly stats = GITHUB_STATS;
  readonly profileUrl = `https://github.com/${GITHUB_STATS.login}`;

  readonly updatedDate = this.formatDate(GITHUB_STATS.fetchedAt);
  readonly latestPushRepo = GITHUB_STATS.latestPush?.repo ?? '';
  readonly latestPushDate = GITHUB_STATS.latestPush ? this.formatDate(GITHUB_STATS.latestPush.at) : '';

  repoUrl(repo: string): string {
    return `${this.profileUrl}/${repo}`;
  }

  private formatDate(iso: string): string {
    return new Intl.DateTimeFormat(undefined, { dateStyle: 'medium', timeZone: 'UTC' })
      .format(new Date(iso));
  }
}
