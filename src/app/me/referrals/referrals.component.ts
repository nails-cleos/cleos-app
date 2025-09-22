import { Component, inject, Inject, OnDestroy, OnInit } from '@angular/core';
import { Store } from '@ngrx/store';
import { AppState, selectDiscountState } from '../../store/app.states';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';
import { MAT_BOTTOM_SHEET_DATA, MatBottomSheet } from '@angular/material/bottom-sheet';
import { environment } from '../../../environments/environment';
import { Observable, Subject } from 'rxjs';
import * as fromActionsDiscount from '../../store/discount.actions';
import { IReferral } from '../../interfaces/discount';
import { AuthUserService } from '../../services/auth-user.service';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { SharedModule } from '../../shared/shared.module';
import { ShareButtonsComponent } from './share-buttons/share-buttons.component';
import { ToastService } from '../../services/toast.service';
import { takeUntil } from 'rxjs/operators';

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

@Component({
  selector: 'app-bottom-sheet-share',
  templateUrl: 'bottom-sheet-share.component.html',
  imports: [SharedModule, ShareButtonsComponent],
})
export class BottomSheetShareComponent {
  message: any;
  code: any;
  url = environment.appServer;
  image = `${this.url}/assets/icons/icon-512x512.png`;
  show: number;

  constructor(@Inject(MAT_BOTTOM_SHEET_DATA) public data: { code: string },
              private translate: TranslateService, breakpointObserver: BreakpointObserver) {
    this.show = 7;
    breakpointObserver.observe([
      Breakpoints.XSmall,
      Breakpoints.Small,
    ]).subscribe(result => {
      if (result.matches) {
        this.show = 5;
      }
    });
    this.code = `${this.url}/auth?code=${data.code}`;
    this.message = this.translate.instant('ME.REFERRAL.LINK', {
      code: data.code,
      url: this.code,
    });
  }
}

@Component({
  selector: 'app-bottom-sheet-referral',
  templateUrl: 'bottom-sheet-referral.component.html',
  styleUrls: ['./bottom-sheet-referral.component.scss'],
  imports: [SharedModule],
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
