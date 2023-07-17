import { Component, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectAuthState, selectDiscountState } from '../../store/app.states';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TranslateService } from '@ngx-translate/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet } from '@angular/material/bottom-sheet';
import { environment } from '../../../environments/environment';
import { IUserAll } from '../../interfaces/user';
import { Observable, Subscription } from 'rxjs';
import * as fromActionsDiscount from '../../store/discount.actions';
import { IUserDiscount } from '../../interfaces/discount';
import { AngularFireAnalytics } from '@angular/fire/compat/analytics';

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.component.html',
  styleUrls: ['./referrals.component.scss']
})
export class ReferralsComponent implements OnInit, OnDestroy {
  user: IUserAll | undefined;
  showInvites = false;
  showShare = false;

  private getState: Observable<any>;
  private subscription: Subscription | undefined;
  private referralMax: number | undefined;
  private referrals = 0;
  private referralsUsed = 0;

  constructor(private store: Store<AppState>, private clipboard: Clipboard, private snackBar: MatSnackBar,
              private translate: TranslateService, private bottomSheet: MatBottomSheet,
              private analytic: AngularFireAnalytics) {
    this.store.select(selectAuthState).subscribe((state: any) => {
      this.user = state.user;
      this.referralMax = this.user && this.user.referralMax ? this.user.referralMax : 5;
    });
    this.getState = this.store.select(selectDiscountState);
    this.analytic.logEvent('screen_view', {
      firebase_screen: 'Referral page',
      firebase_screen_class: 'ReferralsComponent'
    });
  }

  get copy(): void {
    if (this.user) {
      this.clipboard.copy(this.user.id);
      this.snackBar.open(this.translate.instant('ME.REFERRAL.COPY'), 'OK', {
        duration: 5000
      });
    }
    return;
  }

  get openBottomSheetShare(): void {
    this.bottomSheet.open(BottomSheetShareComponent, {
      data: { code: this.user?.id }
    });
    return;
  }

  get openBottomSheetReferral(): void {
    this.bottomSheet.open(BottomSheetReferralComponent, {
      data: { referralMax: this.referralMax, referrals: this.referrals, referralsUsed: this.referralsUsed }
    });
    return;
  }

  ngOnInit(): void {
    this.clean();
    this.subscribe();
    this.getReferrals();
  }

  ngOnDestroy(): void {
    this.subscription?.unsubscribe();
  }

  private clean(): void {
    this.store.dispatch(
      new fromActionsDiscount.Clean()
    );
  }

  private subscribe(): void {
    this.subscription = this.getState.subscribe(state => {
      if (state.referrals) {
        const referrals: IUserDiscount[] = state.referrals;
        this.referrals = referrals.length;
        this.referralsUsed = referrals.filter(referral => referral.used).length;
        this.showInvites = true;
        this.showShare = this.referralMax ? this.referrals < this.referralMax : true;
      }
    });
  }

  private getReferrals(): void {
    this.store.dispatch(
      new fromActionsDiscount.GetReferrals()
    );
  }
}

@Component({
  selector: 'app-bottom-sheet-share',
  templateUrl: 'bottom-sheet-share.component.html'
})
export class BottomSheetShareComponent {
  message: any;
  url = environment.appServer;
  image = `${ this.url }/assets/icons/icon-512x512.png`;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { code: string }, private translate: TranslateService) {
    this.message = this.translate.instant('ME.REFERRAL.LINK', {
      code: data.code,
      url: `${ this.url }/auth?code=${ data.code }`
    });
  }
}

@Component({
  selector: 'app-bottom-sheet-referral',
  templateUrl: 'bottom-sheet-referral.component.html',
  styleUrls: ['./bottom-sheet-referral.component.scss']
})
export class BottomSheetReferralComponent {
  referralMax = 5;
  referrals = 0;
  referralsUsed = 0;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: any) {
    setTimeout(() => {
      this.referralMax = data.referralMax;
      this.referrals = data.referrals;
      this.referralsUsed = data.referralsUsed;
    }, 500);
  }
}
