import { Component, Inject } from '@angular/core';
import { createNewDate, newDate, newDateTimestamp, reservationDuration } from '../../../util/dates';
import { getPrice } from '../../../util/helper';
import { IReview } from '../../../interfaces/review';
import { IReservationAll } from '../../../interfaces/reservation';
import { IPrice } from '../../../interfaces/product';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormControl } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { transitionAnimation } from '../../../util/animation';

@Component({
  selector: 'app-review-dialog',
  templateUrl: './review-dialog.component.html',
  animations: [transitionAnimation],
  styleUrls: ['./review-dialog.component.scss']
})
export class ReviewDialogComponent {
  reservation?: IReservationAll;
  end?: Date;
  language: string;

  price: IPrice;
  rating = -1;
  hover = -1;
  starCount = 5;

  review?: IReview;

  detail = new FormControl();

  constructor(public dialogRef: MatDialogRef<ReviewDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: IReservationAll,
              private translate: TranslateService) {
    const start = newDateTimestamp(data.timestamp, data.room.timeZone)
    this.reservation = Object.assign({}, data, { start });
    this.price = getPrice(data);
    const duration = reservationDuration(data);
    this.end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
    this.review = data.review;
    this.language = this.translate.currentLang;
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
