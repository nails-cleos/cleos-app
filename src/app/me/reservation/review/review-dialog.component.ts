import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { createNewDate, newDateTimestamp, reservationDuration } from '../../../util/dates';
import { getPrice } from '../../../util/helper';
import { IReview } from '../../../interfaces/review';
import { IReservationAll } from '../../../interfaces/reservation';
import { IPrice } from '../../../interfaces/treatment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { transitionAnimation } from '../../../util/animation';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { RoomNamePipe } from '../../../pipes/room-name.pipe';
import { RatingComponent } from '../../../shared/rating/rating.component';
import { DatePipe, DecimalPipe } from '@angular/common';
import { AppMaterialModule } from '../../../util/app-material.module';

@Component({
  selector: 'app-review-dialog',
  templateUrl: './review-dialog.component.html',
  animations: [transitionAnimation],
  styleUrls: ['./review-dialog.component.scss'],
  imports: [RoomNamePipe, RatingComponent, AppMaterialModule, TranslatePipe, DatePipe, DecimalPipe,
    ReactiveFormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewDialogComponent {
  private readonly dialogRef: MatDialogRef<ReviewDialogComponent> = inject(MatDialogRef<ReviewDialogComponent>);
  private readonly data = inject<IReservationAll>(MAT_DIALOG_DATA);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly analytic: Analytics = inject(Analytics);

  reservation?: IReservationAll;
  end?: Date;
  dateFormat: string = this.translate.currentLang;

  price: IPrice = getPrice(this.data);
  rating = -1;
  hover = -1;
  starCount = 5;

  review?: IReview = this.data.review;

  detail = new FormControl<string>('');

  constructor() {
    effect(() => {
      const start = newDateTimestamp(this.data.timestamp, this.data.room.timeZone);
      this.reservation = Object.assign({}, this.data, { start });
      const duration = reservationDuration(this.data);
      this.end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
    });
    logEvent(this.analytic, 'screen_view', {
      // eslint-disable-next-line camelcase
      firebase_screen: 'Review page',
      // eslint-disable-next-line camelcase
      firebase_screen_class: 'ReviewDialogComponent',
    });
  }

  onNoClick() {
    this.dialogRef.close();
  }

  doAction() {
    this.dialogRef.close({ rating: this.rating, detail: this.detail.value });
  }

  onRatingHover = (hover: number) => {
    this.hover = hover;
  };

  onRatingChanged = (rating: number) => {
    this.rating = rating;
  };
}
