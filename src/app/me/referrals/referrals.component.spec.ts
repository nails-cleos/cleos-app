import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReferralsComponent } from './referrals.component';
import { Store } from '@ngrx/store';
import { of } from 'rxjs';
import { Clipboard } from '@angular/cdk/clipboard';
import { TranslateModule } from '@ngx-translate/core';
import { MatBottomSheet } from '@angular/material/bottom-sheet';
import { ToastService } from '../../services/toast.service';
import { AuthUserService } from '../../services/auth-user.service';
import { Analytics } from '@angular/fire/analytics';
import { provideHttpClient } from '@angular/common/http';

describe('ReferralsComponent', () => {
  let component: ReferralsComponent;
  let fixture: ComponentFixture<ReferralsComponent>;

  let storeMock: any;
  let clipboardMock: any;
  let toastMock: any;
  let bottomSheetMock: any;
  let authUserServiceMock: any;

  beforeEach(async () => {
    storeMock = { select: jasmine.createSpy().and.returnValue(of({ referrals: [] })), dispatch: jasmine.createSpy() };
    clipboardMock = { copy: jasmine.createSpy() };
    toastMock = { info: jasmine.createSpy() };
    bottomSheetMock = jasmine.createSpyObj('MatBottomSheet', ['open']);

    authUserServiceMock = { authUser: of({ userId: '123', referralMax: 5 }) };
    const mockAnalytics = {
      app: {
        options: {},
      },
    } as Analytics;

    await TestBed.configureTestingModule({
      imports: [ReferralsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: Store, useValue: storeMock },
        { provide: Clipboard, useValue: clipboardMock },
        { provide: ToastService, useValue: toastMock },
        { provide: MatBottomSheet, useValue: bottomSheetMock },
        { provide: AuthUserService, useValue: authUserServiceMock },
        { provide: Analytics, useValue: mockAnalytics },
        provideHttpClient(),
      ],
    }).compileComponents();

    TestBed.overrideProvider(MatBottomSheet, { useValue: bottomSheetMock });
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReferralsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should copy userId to clipboard and show toast', () => {
    component.userId = 'abc123';
    void component.copy;
    expect(clipboardMock.copy).toHaveBeenCalledWith('abc123');
    expect(toastMock.info).toHaveBeenCalledWith('ME.REFERRAL.COPY');
  });

  it('should open share bottom sheet', () => {
    component.userId = 'abc123';
    component.openBottomSheetShare();
    expect(bottomSheetMock.open).toHaveBeenCalled();
  });

  it('should open referral bottom sheet', () => {
    component['referralMax'] = 5;
    component['referrals'] = 2;
    component['referralsUsed'] = 1;
    component.openBottomSheetReferral();
    expect(bottomSheetMock.open).toHaveBeenCalled();
  });

  it('should set userId and referralMax on ngOnInit', (done) => {
    component.ngOnInit();
    setTimeout(() => {
      expect(component.userId).toBe('123');
      expect(component['referralMax']).toBe(5);
      done();
    });
  });

  it('should call dispatch Clean and GetMyReferrals on ngOnInit', () => {
    expect(storeMock.dispatch).toHaveBeenCalledTimes(2);
  });

  it('should unsubscribe on ngOnDestroy', () => {
    const spyNext = spyOn(component['destroy$'], 'next');
    const spyComplete = spyOn(component['destroy$'], 'complete');
    component.ngOnDestroy();
    expect(spyNext).toHaveBeenCalled();
    expect(spyComplete).toHaveBeenCalled();
  });
});
