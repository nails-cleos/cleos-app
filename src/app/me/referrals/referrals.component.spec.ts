import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferralsComponent } from './referrals.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ToastService } from '@app/services/toast.service';
import {
  AuthUserService,
  IAuthUser,
  initialAuthUser,
} from '@app/services/auth-user.service';
import { provideHttpClient, withXhr } from '@angular/common/http';
import { signal } from '@angular/core';
import { DiscountStore } from '@app/store/discount.store';
import { provideTranslateService } from '@ngx-translate/core';
describe('ReferralsComponent', () => {
  let component: ReferralsComponent;
  let fixture: ComponentFixture<ReferralsComponent>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let discountStoreSpy: {
    referrals: ReturnType<typeof signal>;
    clean: Mock;
    loadReferrals: Mock;
  };
  let clipboardSpy: {
    copy: Mock;
  };
  let toastServiceSpy: {
    show: Mock;
  };
  let bottomSheetSpy: Pick<MatBottomSheet, 'open'> & {
    open: ReturnType<typeof vi.fn>;
  };
  let authUserServiceSpy: Pick<AuthUserService, 'authUser'>;

  beforeEach(async () => {
    discountStoreSpy = {
      referrals: signal<any>(undefined),
      clean: vi.fn().mockName('clean'),
      loadReferrals: vi.fn().mockName('loadReferrals'),
    };
    clipboardSpy = {
      copy: vi.fn().mockName('Clipboard.copy'),
    };
    toastServiceSpy = {
      show: vi.fn().mockName('ToastService.show'),
    };
    bottomSheetSpy = {
      open: vi.fn().mockName('MatBottomSheet.open'),
    };
    authUserServiceSpy = {
      authUser: authUserSignal.asReadonly(),
    };

    await TestBed.configureTestingModule({
      imports: [ReferralsComponent],
      providers: [
        provideTranslateService(),
        { provide: DiscountStore, useValue: discountStoreSpy },
        { provide: Clipboard, useValue: clipboardSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: MatBottomSheet, useValue: bottomSheetSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        provideHttpClient(withXhr()),
      ],
    }).compileComponents();

    TestBed.overrideProvider(MatBottomSheet, { useValue: bottomSheetSpy });

    fixture = TestBed.createComponent(ReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy userId to clipboard and show toast', () => {
    component.userId.set('abc123');

    component.copy();

    expect(clipboardSpy.copy).toHaveBeenCalledWith('abc123');
    expect(toastServiceSpy.show).toHaveBeenCalledWith(
      'ME.REFERRAL.COPY',
      'info',
    );
  });

  it('should open share bottom sheet', () => {
    component.userId.set('abc123');
    component.openBottomSheetShare();
    expect(bottomSheetSpy.open).toHaveBeenCalled();
  });

  it('should open referral bottom sheet', () => {
    component['referralMax'].set(5);
    component['referrals'].set(2);
    component['referralsUsed'].set(1);
    component.openBottomSheetReferral();
    expect(bottomSheetSpy.open).toHaveBeenCalled();
  });

  it('should set userId and referralMax on ngOnInit', () => {
    authUserSignal.update((prev) => ({
      ...prev,
      userId: '123',
      referralMax: 5,
    }));

    fixture.detectChanges();

    expect(component.userId()).toBe('123');
    expect(component['referralMax']()).toBe(5);
  });
});
