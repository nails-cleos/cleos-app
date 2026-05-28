import { ChangeDetectionStrategy, Component, effect, input, output, signal } from '@angular/core';
import { ThemePalette } from '@angular/material/core';
import { NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { MatIcon } from '@angular/material/icon';
import { MatIconButton } from '@angular/material/button';

@Component({
  selector: 'app-rating',
  templateUrl: './rating.component.html',
  styleUrls: ['./rating.component.scss'],
  imports: [MatIcon, MatIconButton, TranslatePipe, NgClass],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RatingComponent {
  rating = input<number>(-1);
  rate = input<string>('REVIEW.YOUR_RATE');
  hover = input<number>(-1);
  starCount = input<number>(5);
  color = input<ThemePalette>('accent');
  canEdit = input<boolean>(false);
  detail = input<string>();
  ratingUpdated = output<number>();
  ratingHover = output<number>();

  ratingArr: Array<number> = [];

  ratingSignal = signal(this.rating());
  hoverSignal = signal(this.hover());

  constructor() {
    effect(() => {
      for (let index = 1; index <= this.starCount(); index++) {
        this.ratingArr.push(index);
      }
    });
  }

  onClick = (rating: number): void => {
    this.ratingSignal.set(this.rating() === rating ? -1 : rating);
    this.ratingUpdated.emit(this.ratingSignal());
  };

  onHover = (hover: number): void => {
    this.hoverSignal.set(hover);
    this.ratingHover.emit(this.hoverSignal());
  };

  fontSet = (
    i: number,
  ): 'material-icons' | 'material-symbols-outlined' => this.hoverSignal() >= i + 1 || this.ratingSignal() >= i + 1 ?
    'material-icons' :
    'material-symbols-outlined';

  setColor = (i: number): ThemePalette => this.hoverSignal() >= i + 1 || this.ratingSignal() >= i + 1 ? this.color() :
    undefined;
}
