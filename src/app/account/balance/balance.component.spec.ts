import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BalanceComponent } from './balance.component';
import { IAccountAll } from '../account';

describe('BalanceComponent', () => {
  let component: BalanceComponent;
  let fixture: ComponentFixture<BalanceComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BalanceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(BalanceComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Input properties', () => {
    it('should accept account input', () => {
      const mockAccount: IAccountAll = {
        id: '1',
        balance: 1000,
        customer: {} as any,
        currency: {} as any,
      };
      fixture.componentRef.setInput('account', mockAccount);
      expect(component.account()).toEqual(mockAccount);
    });

    it('should accept showAdd input', () => {
      fixture.componentRef.setInput('showAdd', true);
      expect(component.showAdd()).toBeTrue();
    });

    it('should accept showView input', () => {
      fixture.componentRef.setInput('showView', false);
      expect(component.showView()).toBeFalse();
    });

    it('should accept showUser input', () => {
      fixture.componentRef.setInput('showUser', true);
      expect(component.showUser()).toBeTrue();
    });

    it('should accept language input', () => {
      fixture.componentRef.setInput('language', 'en');
      expect(component.language()).toBe('en');
    });
  });

  describe('balancePercentage getter', () => {
    it('should return 0 when account is undefined', () => {
      fixture.componentRef.setInput('account', undefined);
      expect(component.balancePercentage).toBe(0);
    });

    it('should return 100 when balance is greater than 2000', () => {
      fixture.componentRef.setInput('account', {
        id: '1',
        balance: 2500,
        customer: {} as any,
        currency: {} as any,
      });
      expect(component.balancePercentage).toBe(100);
    });

    it('should return 100 when balance equals 2000', () => {
      fixture.componentRef.setInput('account', {
        id: '1',
        balance: 2000,
        customer: {} as any,
        currency: {} as any,
      });
      expect(component.balancePercentage).toBe(100);
    });

    it('should calculate correct percentage when balance is less than 2000', () => {
      fixture.componentRef.setInput('account', {
        id: '1',
        balance: 1000,
        customer: {} as any,
        currency: {} as any,
      });
      expect(component.balancePercentage).toBe(50);
    });

    it('should return 0 when balance is 0', () => {
      fixture.componentRef.setInput('account', {
        id: '1',
        balance: 0,
        customer: {} as any,
        currency: {} as any,
      });
      expect(component.balancePercentage).toBe(0);
    });

    it('should calculate correct percentage for fractional results', () => {
      fixture.componentRef.setInput('account', {
        id: '1',
        balance: 500,
        customer: {} as any,
        currency: {} as any,
      });
      expect(component.balancePercentage).toBe(25);
    });
  });
});
