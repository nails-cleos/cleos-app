import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountCreatePageComponent } from './discount-create-page.component';
import { DiscountStore } from '../store/discount.store';
import { IDiscountAll } from './discount';
import { CurrencyStore } from '../store/currency.store';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';
import { DateAdapter } from '@angular/material/core';

describe('DiscountCreatePageComponent', () => {
  let component: DiscountCreatePageComponent;
  let fixture: ComponentFixture<DiscountCreatePageComponent>;

  let discountStoreSpy: {
    clean: Mock;
    create: Mock;
  };

  let currencyStoreSpy: {
    loadAll: Mock;
  };

  const mockDiscount: Partial<IDiscountAll> = {
    name: 'Test Discount',
    description: 'Test Description',
  };

  beforeEach(async () => {
    discountStoreSpy = {
      clean: vi.fn().mockName('clean'),
      create: vi.fn().mockName('create'),
    };
    currencyStoreSpy = {
      loadAll: vi.fn().mockName('loadAll'),
    };

    await TestBed.configureTestingModule({
      imports: [DiscountCreatePageComponent],
      providers: [
        provideTranslateService(),
        provideRouter([]),
        { provide: DiscountStore, useValue: discountStoreSpy },
        { provide: CurrencyStore, useValue: currencyStoreSpy },
        { provide: DateAdapter, useValue: { setLocale: vi.fn() } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call create when discount is received', () => {
    component.submit(mockDiscount);

    expect(discountStoreSpy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Discount',
        description: 'Test Description',
      }),
    );
  });
});
