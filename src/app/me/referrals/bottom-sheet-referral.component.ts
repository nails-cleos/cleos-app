import { Component, Inject } from '@angular/core';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { TranslatePipe } from '@ngx-translate/core';
import { AppMaterialModule } from '../../util/app-material.module';

@Component({
  selector: 'app-bottom-sheet-referral',
  templateUrl: 'bottom-sheet-referral.component.html',
  styleUrls: ['./bottom-sheet-referral.component.scss'],
  imports: [AppMaterialModule, TranslatePipe],
})
export class BottomSheetReferralComponent {
  referralMax = 5;
  referrals = 0;
  referralsUsed = 0;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
    this.referralMax = data.referralMax;
    const max = data.referrals > data.referralsUsed ? data.referrals : data.referralsUsed;
    this.delay(data, 0, max);
  }

  private delay = (data: any, count: number, max: number): void => {
    setTimeout(() => {
      count++;
      this.referrals = count > data.referrals ? data.referrals : count;
      this.referralsUsed = count > data.referralsUsed ? data.referralsUsed : count;
      if (count < max) {
        this.delay(data, count, max);
      }
    }, 500);
  };
}
