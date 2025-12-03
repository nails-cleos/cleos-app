import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferralsComponent } from './referrals.component';
import { Store } from '@ngrx/store';
import { BehaviorSubject } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ToastService } from '../../services/toast.service';
import { AuthUserService, IAuthUser, initialAuthUser } from '../../services/auth-user.service';
import { Analytics } from '@angular/fire/analytics';
import { provideHttpClient } from '@angular/common/http';
import { DiscountState } from '../../store/reducers/discount.reducers';
import { AnalyticsStub } from '../../util/firebase-stub';
import { signal } from '@angular/core';

describe('ReferralsComponent', () => {
  let component: ReferralsComponent;
  let fixture: ComponentFixture<ReferralsComponent>;

  let referrals$: BehaviorSubject<any>;
  const authUserSignal = signal<IAuthUser>(initialAuthUser);

  let storeSpy: jasmine.SpyObj<Store<DiscountState>>;
  let clipboardSpy: jasmine.SpyObj<Clipboard>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let bottomSheetSpy: jasmine.SpyObj<MatBottomSheet>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    referrals$ = new BehaviorSubject<any>(undefined);

    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    clipboardSpy = jasmine.createSpyObj('Clipboard', ['copy']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['info']);
    bottomSheetSpy = jasmine.createSpyObj('MatBottomSheet', ['open']);
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUserSignal.asReadonly(),
    });

    let pipeCallIndex = 0;
    storeSpy.pipe.and.callFake(() => {
      pipeCallIndex++;
      switch (pipeCallIndex) {
        case 1:
          return referrals$.asObservable();
        default:
          return new BehaviorSubject(undefined).asObservable();
      }
    });

    await TestBed.configureTestingModule({
      imports: [ReferralsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Clipboard, useValue: clipboardSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: MatBottomSheet, useValue: bottomSheetSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: Analytics, useClass: AnalyticsStub },
        provideHttpClient(),
      ],
    }).compileComponents();

    TestBed.overrideProvider(MatBottomSheet, { useValue: bottomSheetSpy });

    fixture = TestBed.createComponent(ReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    referrals$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy userId to clipboard and show toast', () => {
    component.userId.set('abc123');

    component.copy();

    expect(clipboardSpy.copy).toHaveBeenCalledWith('abc123');
    expect(toastServiceSpy.info).toHaveBeenCalledWith('ME.REFERRAL.COPY');
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
