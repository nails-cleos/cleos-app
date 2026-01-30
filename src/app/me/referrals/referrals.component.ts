import { ChangeDetectionStrategy, Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { Store } from '@ngrx/store';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateService } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AuthUserService } from '../../services/auth-user.service';
import { Analytics, logEvent } from '@angular/fire/analytics';
import { SharedModule } from '../../shared/shared.module';
import { ToastService } from '../../services/toast.service';
import { BottomSheetShareComponent } from './bottom-sheet-share.component';
import { BottomSheetReferralComponent } from './bottom-sheet-referral.component';
import { getReferralsPipe } from '../../store/selectors/discount.selectors';
import { toSignal } from '@angular/core/rxjs-interop';
import { DiscountState } from '../../store/reducers/discount.reducers';

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.component.html',
  styleUrls: ['./referrals.component.scss'],
  imports: [SharedModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferralsComponent {
  private readonly store: Store<DiscountState> = inject(Store<DiscountState>);
  private readonly clipboard: Clipboard = inject(Clipboard);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly bottomSheet: MatBottomSheet = inject(MatBottomSheet);
  private readonly analytic: Analytics = inject(Analytics);
  private readonly authUserService: AuthUserService = inject(AuthUserService);

  private referrals$ = this.store.pipe(getReferralsPipe);

  private referralsSignal = toSignal(this.referrals$);
  private authUserSignal = this.authUserService.authUser;

  private referralMax: WritableSignal<number | undefined> = signal(undefined);
  private referrals = signal(0);
  private referralsUsed = signal(0);

  userId: WritableSignal<string | undefined> = signal(undefined);
  showInvites = signal(false);

  showShare = signal(false);

  constructor() {
    logEvent(this.analytic, 'screen_view', {
      // eslint-disable-next-line camelcase
      firebase_screen: 'Referral page',
      // eslint-disable-next-line camelcase
      firebase_screen_class: 'ReferralsComponent',
    });

    effect(() => {
      const referrals = this.referralsSignal();
      if (referrals) {
        const referralMax = this.referralMax();
        this.referrals.set(referrals.length);
        this.referralsUsed.set(referrals.filter(referral => referral.used).length);
        this.showInvites.set(true);
        this.showShare.set(referralMax ? referrals.length < referralMax : true);
      }
    });

    effect(() => {
      const authUser = this.authUserSignal();
      if (authUser) {
        this.userId.set(authUser.userId);
        this.referralMax.set(authUser.referralMax);
      }
    });
  }

  copy() {
    const userId = this.userId();
    if (userId) {
      this.clipboard.copy(userId);
      this.toastService.show(this.translate.instant('ME.REFERRAL.COPY'), 'info');
    }
  }

  openBottomSheetShare() {
    const code = this.userId();
    if (code) {
      this.bottomSheet.open(BottomSheetShareComponent, { data: { code } });
    }
  }

  openBottomSheetReferral() {
    this.bottomSheet.open(BottomSheetReferralComponent, {
      data: { referralMax: this.referralMax(), referrals: this.referrals(), referralsUsed: this.referralsUsed() },
    });
  }
}
