import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { BottomSheetReferralComponent, BottomSheetReferralData } from './bottom-sheet-referral.component';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { provideTranslateService } from "@ngx-translate/core";

describe('BottomSheetReferralComponent', () => {
  let component: BottomSheetReferralComponent;
  let fixture: ComponentFixture<BottomSheetReferralComponent>;

  const mockData: BottomSheetReferralData = {
    referralMax: 10,
    referrals: 3,
    referralsUsed: 5,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BottomSheetReferralComponent],
      providers: [
        provideTranslateService(),
        { provide: MAT_BOTTOM_SHEET_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(BottomSheetReferralComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize referralMax from data', () => {
    expect(component.referralMax).toBe(mockData.referralMax!);
  });

  it('should gradually increase referrals and referralsUsed up to their limits', fakeAsync(() => {
    const data = { referralMax: 10, referrals: 3, referralsUsed: 5 };

    component['delay'](data, 0, Math.max(data.referrals, data.referralsUsed));

    for (let i = 1; i <= data.referralsUsed; i++) {
      tick(500);
      expect(component.referrals).toBeLessThanOrEqual(data.referrals);
      expect(component.referralsUsed).toBeLessThanOrEqual(data.referralsUsed);
    }

    expect(component.referrals).toBe(data.referrals);
    expect(component.referralsUsed).toBe(data.referralsUsed);
  }));

  it('should call delay recursively until max count reached', fakeAsync(() => {
    const delaySpy = spyOn(component as any, 'delay').and.callThrough();

    const data = { referralMax: 10, referrals: 3, referralsUsed: 5 };
    component['delay'](data, 0, Math.max(data.referrals, data.referralsUsed));

    tick(5000);

    expect(delaySpy).toHaveBeenCalled();
    expect(delaySpy.calls.count()).toBeGreaterThan(1);
    expect(component.referrals).toBe(data.referrals);
    expect(component.referralsUsed).toBe(data.referralsUsed);
  }));
});
