import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'app-upcoming-skeleton',
  templateUrl: './upcoming-skeleton.component.html',
  imports: [MatTabGroup, MatTab],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UpcomingSkeletonComponent {
  tabCount = input(2);
  fieldCardCount = input(3);

  tabs = (): number[] => Array.from({ length: this.tabCount() }, (_, index) => index);
  fieldCards = (): number[] => Array.from({ length: this.fieldCardCount() }, (_, index) => index);
}
