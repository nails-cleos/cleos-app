import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CurrencyDetailsPageComponent } from './currency-details-page.component';
import { CurrencyStore } from '../store/currency.store';
import { ICurrencyAll } from './currency';
import { DateAdapter } from '@angular/material/core';
import { provideTranslateService } from '@ngx-translate/core';
import { provideRouter } from '@angular/router';

describe('CurrencyDetailsPageComponent', () => {
  let component: CurrencyDetailsPageComponent;
  let fixture: ComponentFixture<CurrencyDetailsPageComponent>;

  let currencyStoreSpy: {
    selected: ReturnType<typeof signal>;
    clean: Mock;
    loadById: Mock;
    update: Mock;
  };

  const id = '123';

  const mockCurrency: Partial<ICurrencyAll> = {
    id,
    name: 'Test Currency',
    code: 'EUR',
    icon: 'euro',
  };

  beforeEach(async () => {
    currencyStoreSpy = {
      selected: signal<any>(undefined),
      clean: vi.fn().mockName('clean'),
      loadById: vi.fn().mockName('loadById'),
      update: vi.fn().mockName('update'),
    };

    await TestBed.configureTestingModule({
      imports: [CurrencyDetailsPageComponent],
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

    fixture = TestBed.createComponent(CurrencyDetailsPageComponent);
    fixture.componentRef.setInput('id', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load currency when id emits a value', () => {
    fixture.componentRef.setInput('id', '1234');
    fixture.detectChanges();

    expect(currencyStoreSpy.clean).toHaveBeenCalled();
    expect(currencyStoreSpy.loadById).toHaveBeenCalledWith('1234');
  });

  it('should call update when currency is received', () => {
    fixture.detectChanges();

    component.submit(mockCurrency);

    expect(currencyStoreSpy.update).toHaveBeenCalledWith(
      id,
      expect.objectContaining({
        name: 'Test Currency',
        code: 'EUR',
        icon: 'euro',
      }),
    );
  });
});
