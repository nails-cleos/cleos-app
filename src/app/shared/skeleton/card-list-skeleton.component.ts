import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-card-list-skeleton',
  templateUrl: './card-list-skeleton.component.html',
  styleUrl: './card-list-skeleton.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CardListSkeletonComponent {
  cardCount = input(3);
  badgeCount = input(2);
  actionCount = input(3);
  descriptionLines = input(2);
  showMedia = input(true);

  cards = (): number[] =>
    Array.from({ length: this.cardCount() }, (_, index) => index);
  badges = (): number[] =>
    Array.from({ length: this.badgeCount() }, (_, index) => index);
  actions = (): number[] =>
    Array.from({ length: this.actionCount() }, (_, index) => index);
  lines = (): number[] =>
    Array.from({ length: this.descriptionLines() }, (_, index) => index);
}
