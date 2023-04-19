import { Component, Inject } from '@angular/core';
import { createNewDate, newDate, newDateTimestamp, reservationDuration } from '../../../util/dates';
import { getPrice } from '../../../util/helper';
import { IReview } from '../../../interfaces/review';
import { IReservationAll } from '../../../interfaces/reservation';
import { IPrice } from '../../../interfaces/treatment';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { UntypedFormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { transitionAnimation } from '../../../util/animation';
import { AngularFireAnalytics } from "@angular/fire/compat/analytics";

@Component({
  selector: 'app-review-dialog',
  templateUrl: './review-dialog.component.html',
  animations: [transitionAnimation],
  styleUrls: ['./review-dialog.component.scss']
})
export class ReviewDialogComponent {
  reservation?: IReservationAll;
  end?: Date;
  dateFormat: string;

  price: IPrice;
  rating = -1;
  hover = -1;
  starCount = 5;

  review?: IReview;

  detail = new UntypedFormControl();

  constructor(public dialogRef: MatDialogRef<ReviewDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: IReservationAll,
              private translate: TranslateService, private analytic: AngularFireAnalytics) {
    const start = newDateTimestamp(data.timestamp, data.room.timeZone)
    this.reservation = Object.assign({}, data, { start });
    this.price = getPrice(data);
    const duration = reservationDuration(data);
    this.end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
    this.review = data.review;
    this.dateFormat = this.translate.currentLang;
    this.analytic.logEvent('screen_view', {
      firebase_screen: 'Review page',
      firebase_screen_class: 'ReviewDialogComponent'
    });
  }

  get onNoClick(): void {
    return this.dialogRef.close();
  }

  get doAction(): void {
    return this.dialogRef.close({rating: this.rating, detail: this.detail.value});
  }

  onRatingHover(hover: number): void {
    this.hover = hover;
  }

  onRatingChanged(rating: number): void {
    this.rating = rating;
  }
}
