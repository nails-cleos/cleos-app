import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferralsComponent } from './referrals.component';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ToastService } from '../../services/toast.service';
import { AuthUserService } from '../../services/auth-user.service';
import { Analytics } from '@angular/fire/analytics';
import { provideHttpClient } from '@angular/common/http';
import { AppState } from '../../store/app.states';

describe('ReferralsComponent', () => {
  let component: ReferralsComponent;
  let fixture: ComponentFixture<ReferralsComponent>;

  let state$: Subject<any>;
  let authUser$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let clipboardSpy: jasmine.SpyObj<Clipboard>;
  let toastServiceSpy: jasmine.SpyObj<ToastService>;
  let bottomSheetSpy: jasmine.SpyObj<MatBottomSheet>;
  let analyticsSpy: jasmine.SpyObj<Analytics>;
  let authUserServiceSpy: jasmine.SpyObj<AuthUserService>;

  beforeEach(async () => {
    state$ = new Subject<any>();
    authUser$ = new Subject<any>();

    storeSpy = jasmine.createSpyObj('Store', ['dispatch', 'select']);
    clipboardSpy = jasmine.createSpyObj('Clipboard', ['copy']);
    toastServiceSpy = jasmine.createSpyObj('ToastService', ['info']);
    bottomSheetSpy = jasmine.createSpyObj('MatBottomSheet', ['open']);
    analyticsSpy = jasmine.createSpyObj('Analytics', ['logEvent'], {
      app: { options: {} },
      gtagFunction: () => {
      },
    });
    authUserServiceSpy = jasmine.createSpyObj('AuthUserService', [], {
      authUser: authUser$.asObservable(),
    });

    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ReferralsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeSpy },
        { provide: Clipboard, useValue: clipboardSpy },
        { provide: ToastService, useValue: toastServiceSpy },
        { provide: MatBottomSheet, useValue: bottomSheetSpy },
        { provide: AuthUserService, useValue: authUserServiceSpy },
        { provide: Analytics, useValue: analyticsSpy },
        provideHttpClient(),
      ],
    }).compileComponents();

    TestBed.overrideProvider(MatBottomSheet, { useValue: bottomSheetSpy });

    fixture = TestBed.createComponent(ReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    state$.complete();
    authUser$.complete();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy userId to clipboard and show toast', () => {
    component.userId = 'abc123';
    void component.copy;
    expect(clipboardSpy.copy).toHaveBeenCalledWith('abc123');
    expect(toastServiceSpy.info).toHaveBeenCalledWith('ME.REFERRAL.COPY');
  });

  it('should open share bottom sheet', () => {
    component.userId = 'abc123';
    component.openBottomSheetShare();
    expect(bottomSheetSpy.open).toHaveBeenCalled();
  });

  it('should open referral bottom sheet', () => {
    component['referralMax'] = 5;
    component['referrals'] = 2;
    component['referralsUsed'] = 1;
    component.openBottomSheetReferral();
    expect(bottomSheetSpy.open).toHaveBeenCalled();
  });

  it('should set userId and referralMax on ngOnInit', () => {
    component.ngOnInit();

    authUser$.next({ userId: '123', referralMax: 5 });

    expect(component.userId).toBe('123');
    expect(component['referralMax']).toBe(5);
  });

  it('should call dispatch Clean and GetMyReferrals on ngOnInit', () => {
    expect(storeSpy.dispatch).toHaveBeenCalledTimes(2);
  });

  it('should unsubscribe on ngOnDestroy', () => {
    const spyNext = spyOn(component['destroy$'], 'next');
    const spyComplete = spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(spyNext).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });
});
