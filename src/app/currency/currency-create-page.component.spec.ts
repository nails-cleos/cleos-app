import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyCreatePageComponent } from './currency-create-page.component';
import { CurrencyStore } from '../store/currency.store';
import { ICurrencyAll } from './currency';
import { DateAdapter } from '@angular/material/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('CurrencyCreatePageComponent', () => {
  let component: CurrencyCreatePageComponent;
  let fixture: ComponentFixture<CurrencyCreatePageComponent>;

  let currencyStoreSpy: {
    create: Mock;
  };

  const mockCurrency: Partial<ICurrencyAll> = {
    name: 'Test Currency',
    code: 'EUR',
    icon: 'euro',
  };

  beforeEach(async () => {
    currencyStoreSpy = {
      create: vi.fn().mockName('create'),
    };

    await TestBed.configureTestingModule({
      imports: [CurrencyCreatePageComponent],
      providers: [
        provideTranslateService(),
        provideRouter([]),
        { provide: CurrencyStore, useValue: currencyStoreSpy },
        { provide: DateAdapter, useValue: { setLocale: vi.fn() } },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyCreatePageComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call create when currency is received', () => {
    component.submit(mockCurrency);

    expect(currencyStoreSpy.create).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'Test Currency',
        code: 'EUR',
        icon: 'euro',
      }),
    );
  });
});
