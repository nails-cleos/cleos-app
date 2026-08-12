import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TranslatePipe } from '@ngx-translate/core';
import { MatProgressBar } from '@angular/material/progress-bar';
import { MatHint } from '@angular/material/input';

export type BottomSheetReferralData = {
  referralMax?: number;
  referrals: number;
  referralsUsed: number;
};

@Component({
  selector: 'app-bottom-sheet-referral',
  templateUrl: 'bottom-sheet-referral.component.html',
  styleUrls: ['./bottom-sheet-referral.component.scss'],
  imports: [TranslatePipe, TranslatePipe, MatProgressBar, MatHint],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BottomSheetReferralComponent {
  private readonly data = inject<BottomSheetReferralData>(
    MAT_BOTTOM_SHEET_DATA,
  );
  referralMax = this.data.referralMax || 5;
  referrals = 0;
  referralsUsed = 0;

  constructor() {
    const max =
      this.data.referrals > this.data.referralsUsed
        ? this.data.referrals
        : this.data.referralsUsed;
    this.delay(this.data, 0, max);
  }

  private delay = (
    data: BottomSheetReferralData,
    count: number,
    max: number,
  ): void => {
    setTimeout(() => {
      count++;
      this.referrals = count > data.referrals ? data.referrals : count;
      this.referralsUsed =
        count > data.referralsUsed ? data.referralsUsed : count;
      if (count < max) {
        this.delay(data, count, max);
      }
    }, 500);
  };
}
