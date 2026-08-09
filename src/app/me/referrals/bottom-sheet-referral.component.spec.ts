import { ComponentFixture, TestBed } from '@angular/core/testing';
import {
  BottomSheetReferralComponent,
  BottomSheetReferralData,
} from './bottom-sheet-referral.component';
import { MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { provideTranslateService } from '@ngx-translate/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

  it('should gradually increase referrals and referralsUsed up to their limits', () => {
    vi.useFakeTimers();
    try {
      const data = { referralMax: 10, referrals: 3, referralsUsed: 5 };

      component['delay'](data, 0, Math.max(data.referrals, data.referralsUsed));

      for (let i = 1; i <= data.referralsUsed; i++) {
        vi.advanceTimersByTime(500);
        expect(component.referrals).toBeLessThanOrEqual(data.referrals);
        expect(component.referralsUsed).toBeLessThanOrEqual(data.referralsUsed);
      }

      expect(component.referrals).toBe(data.referrals);
      expect(component.referralsUsed).toBe(data.referralsUsed);
    } finally {
      vi.useRealTimers();
    }
  });

  it('should call delay recursively until max count reached', () => {
    vi.useFakeTimers();
    try {
      const delaySpy = vi.spyOn(component as any, 'delay');

      const data = { referralMax: 10, referrals: 3, referralsUsed: 5 };
      component['delay'](data, 0, Math.max(data.referrals, data.referralsUsed));

      vi.advanceTimersByTime(5_000);

      expect(delaySpy).toHaveBeenCalled();
      expect(vi.mocked(delaySpy).mock.calls.length).toBeGreaterThan(1);
      expect(component.referrals).toBe(data.referrals);
      expect(component.referralsUsed).toBe(data.referralsUsed);
    } finally {
      vi.useRealTimers();
    }
  });
});
