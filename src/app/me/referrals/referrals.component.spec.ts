import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferralsComponent } from './referrals.component';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ToastService } from '../../services/toast.service';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { provideHttpClient } from '@angular/common/http';
import { signal } from '@angular/core';
import { DiscountStore } from '../../store/discount.store';

describe('ReferralsComponent', () => {
  let component: ReferralsComponent;
  let fixture: ComponentFixture<ReferralsComponent>;

  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let discountStoreSpy: {
    referrals: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadReferrals: jasmine.Spy;
  };
  let clipboardSpy: jasmine.SpyObj<Clipboard>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let bottomSheetSpy: jasmine.SpyObj<MatBottomSheet>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    discountStoreSpy = {
      referrals: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadReferrals: jasmine.createSpy('loadReferrals'),
    };
    clipboardSpy = jasmine.createSpyObj('Clipboard', ['copy']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['show']);
    bottomSheetSpy = jasmine.createSpyObj('MatBottomSheet', ['open']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });

    await TestBed.configureTestingModule({
      imports: [ReferralsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DiscountStore, useValue: discountStoreSpy },
        { provide: Clipboard, useValue: clipboardSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: MatBottomSheet, useValue: bottomSheetSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        provideHttpClient(),
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
    expect(toastServiceSpy.show).toHaveBeenCalledWith('ME.REFERRAL.COPY', 'info');
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
    authUserSignal.update(prev => ({ ...prev, userId: '123', referralMax: 5 }));

    fixture.detectChanges();

    expect(component.userId()).toBe('123');
    expect(component['referralMax']()).toBe(5);
  });
});
