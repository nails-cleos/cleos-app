import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectDiscountState } from '../../store/app.states';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { Observable, Subject } from 'rxjs';
import * as fromActionsDiscount from '../../store/discount.actions';
import { IReferral } from '../../interfaces/discount';
import { AuthUserService } from '../../services/auth-user.service';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { SharedModule } from '../../shared/shared.module';
import { ToastService } from '../../services/toast.service';
import { takeUntil } from 'rxjs/operators';
import { BottomSheetShareComponent } from './bottom-sheet-share.component';
import { BottomSheetReferralComponent } from './bottom-sheet-referral.component';

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.component.html',
  styleUrls: ['./referrals.component.scss'],
  imports: [SharedModule],
})
export class ReferralsComponent implements OnInit, OnDestroy {
  private store: Store<AppState> = inject(Store<AppState>);
  private clipboard: Clipboard = inject(Clipboard);
  private toastService: ToastService = inject(ToastService);
  private translate: TranslateService = inject(TranslateService);
  private bottomSheet: MatBottomSheet = inject(MatBottomSheet);
  private analytic: Analytics = inject(Analytics);
  private authUserService: AuthUserService = inject(AuthUserService);

  userId?: string;
  showInvites = false;
  showShare = false;

  private destroy$ = new Subject<void>();
  private getState: Observable<any> = this.store.select(selectDiscountState);
  private referralMax: number | undefined;
  private referrals = 0;
  private referralsUsed = 0;

  get copy(): void {
    if (this.userId) {
      this.clipboard.copy(this.userId);
      this.toastService.info(this.translate.instant('ME.REFERRAL.COPY'));
    }
    return;
  }

  ngOnInit(): void {
    this.authUserService.authUser.pipe(takeUntil(this.destroy$)).subscribe(value => {
      this.userId = value.userId;
      this.referralMax = value.referralMax;
    });
    logEvent(this.analytic, 'screen_view', {
      // eslint-disable-next-line camelcase
      firebase_screen: 'Referral page',
      // eslint-disable-next-line camelcase
      firebase_screen_class: 'ReferralsComponent',
    });
    this.clean();
    this.subscribe();
    this.getReferrals();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  openBottomSheetShare(): void {
    this.bottomSheet.open(BottomSheetShareComponent, {
      data: { code: this.userId },
    });
    return;
  }

  openBottomSheetReferral(): void {
    this.bottomSheet.open(BottomSheetReferralComponent, {
      data: { referralMax: this.referralMax, referrals: this.referrals, referralsUsed: this.referralsUsed },
    });
    return;
  }

  private clean = (): void => this.store.dispatch(new fromActionsDiscount.Clean());

  private getReferrals = (): void => this.store.dispatch(new fromActionsDiscount.GetMyReferrals());

  private subscribe = (): void => {
    this.getState.pipe(takeUntil(this.destroy$)).subscribe((state) => {
      if (state.referrals) {
        const referrals: IReferral[] = state.referrals;
        this.referrals = referrals.length;
        this.referralsUsed = referrals.filter(referral => referral.used).length;
        this.showInvites = true;
        this.showShare = this.referralMax ? this.referrals < this.referralMax : true;
      }
    });
  };
}
