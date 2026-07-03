import { ChangeDetectionStrategy, Component, effect, inject, signal, WritableSignal } from '@angular/core';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { AuthUserService } from '../../services/auth-user.service';
import { ToastService } from '../../services/toast.service';
import { BottomSheetShareComponent } from './bottom-sheet-share.component';
import { BottomSheetReferralComponent } from './bottom-sheet-referral.component';
import { FirebaseService } from '../../services/firebase.service';
import { MatIcon } from '@angular/material/icon';
import { MatButton } from '@angular/material/button';
import { DiscountStore } from '../../store/discount.store';

@Component({
  selector: 'app-referrals',
  templateUrl: './referrals.component.html',
  styleUrls: ['./referrals.component.scss'],
  imports: [MatIcon, MatButton, TranslatePipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReferralsComponent {
  private readonly discountStore = inject(DiscountStore);
  private readonly clipboard: Clipboard = inject(Clipboard);
  private readonly toastService: ToastService = inject(ToastService);
  private readonly translateService: TranslateService = inject(TranslateService);
  private readonly bottomSheet: MatBottomSheet = inject(MatBottomSheet);
  private readonly authUserService: AuthUserService = inject(AuthUserService);
  private readonly firebaseService = inject(FirebaseService);

  private referralsSignal = this.discountStore.referrals;
  private authUserSignal = this.authUserService.authUser;

  private referralMax: WritableSignal<number | undefined> = signal(undefined);
  private referrals = signal(0);
  private referralsUsed = signal(0);

  userId: WritableSignal<string | undefined> = signal(undefined);
  showInvites = signal(false);

  showShare = signal(false);

  constructor() {
    this.firebaseService.logEvent('screen_view', {
      // eslint-disable-next-line camelcase
      firebase_screen: 'Referral page',
      // eslint-disable-next-line camelcase
      firebase_screen_class: 'ReferralsComponent',
    });
    this.discountStore.clean();
    this.discountStore.loadReferrals();

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
      this.toastService.show(this.translateService.instant('ME.REFERRAL.COPY'), 'info');
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
