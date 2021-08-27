import { Component, Inject } from '@angular/core';
import { convertDuration, createNewDate, newDate } from '../../../util/dates';
import { getPrice, getUserName } from '../../../util/helper';
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
  reservation: IReservationAll | undefined;
  end: Date | undefined;
  language: string;

  price: IPrice;
  rating = -1;
  hover = -1;
  starCount = 5;

  review: IReview | undefined;

  detail = new FormControl();

  constructor(public dialogRef: MatDialogRef<ReviewDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: IReservationAll,
              private translate: TranslateService) {
    this.reservation = data;
    this.price = getPrice(data.product);
    const duration = convertDuration(data.product.duration);
    const start = newDate(data.start);
    this.end = createNewDate(start, start.getHours() + duration.hour, start.getMinutes() + duration.minute);
    this.review = data.review;
    this.language = this.translate.currentLang;
  }

  get professionalName(): string {
    return getUserName(this.reservation?.room.professional);
  }

  onNoClick(): void {
    this.dialogRef.close();
  }

  doAction(): void {
    this.dialogRef.close({rating: this.rating, detail: this.detail.value});
  }

  onRatingHover(hover: number): void {
    this.hover = hover;
  }

  onRatingChanged(rating: number): void {
    this.rating = rating;
  }
}
