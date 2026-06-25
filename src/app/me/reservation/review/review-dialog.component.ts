import { ChangeDetectionStrategy, Component, effect, inject } from '@angular/core';
import { createNewDate, newDateTimestamp, reservationDuration } from '../../../util/dates';
import { getPrice } from '../../../util/helper';
import { IReview } from '../list/review';
import { IReservationAll } from '../../../reservation/reservation';
import { IPrice } from '../../../treatment/treatment';
import {
  MAT_DIALOG_DATA,
  MatDialogActions,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { RoomNamePipe } from '../../../pipes/room-name.pipe';
import { RatingComponent } from '../../../shared/rating/rating.component';
import { DatePipe, DecimalPipe } from '@angular/common';
import { FirebaseService } from '../../../services/firebase.service';
import { MatFormField, MatHint, MatInput, MatLabel } from '@angular/material/input';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { MatDivider } from '@angular/material/list';
import { NavigationService } from '../../../services/navigation.service';

@Component({
  selector: 'app-review-dialog',
  templateUrl: './review-dialog.component.html',
  styleUrls: ['./review-dialog.component.scss'],
  imports: [RoomNamePipe, RatingComponent, MatFormField, MatLabel, MatInput, MatIcon, MatButton, TranslatePipe,
    DecimalPipe, DatePipe, ReactiveFormsModule, MatDialogTitle, MatDialogContent, MatDivider, MatHint,
    MatDialogActions],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReviewDialogComponent {
  private readonly dialogRef: MatDialogRef<ReviewDialogComponent> = inject(MatDialogRef<ReviewDialogComponent>);
  private readonly data = inject<IReservationAll>(MAT_DIALOG_DATA);
  private readonly navigationService: NavigationService = inject(NavigationService);
  private readonly firebaseService = inject(FirebaseService);

  reservation?: IReservationAll;
  end?: Date;
  readonly language: string = this.navigationService.language;

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
    this.firebaseService.logEvent('screen_view', {
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
