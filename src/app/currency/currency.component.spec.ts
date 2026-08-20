import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { CurrencyComponent } from './currency.component';
import { ICurrencyAll } from './currency';
import { ICommon } from '../interfaces/common';
import { CurrencyStore } from '../store/currency.store';
import { NavigationService } from '../services/navigation.service';
import { provideTranslateService } from '@ngx-translate/core';

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;

  let currencyStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: Mock;
  };

  const mockCurrency: ICurrencyAll = {
    id: '1',
    name: 'Test Currency',
    code: 'EUR',
    icon: 'euro',
  };
  const config: ICommon = {
    title: 'CURRENCY.TITLE',
    button: { icon: 'add', label: 'COMMON.BUTTON.CREATE' },
  };

  beforeEach(async () => {
    currencyStoreSpy = {
      selected: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: vi.fn().mockName('clean'),
    };
    const navigationServiceSpy = {
      back: vi.fn().mockName('NavigationService.back'),
    };

    await TestBed.configureTestingModule({
      imports: [CurrencyComponent],
      providers: [
        provideTranslateService(),
        { provide: CurrencyStore, useValue: currencyStoreSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

    fixture = TestBed.createComponent(CurrencyComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('config', config);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should patch form when selectedCurrency emits', () => {
    fixture.componentRef.setInput('currency', mockCurrency);
    fixture.detectChanges();

    expect(component.getForm.code.value).toBe(mockCurrency.code);
    expect(component.getForm.name.value).toBe(mockCurrency.name);
    expect(component.getForm.icon.value).toBe(mockCurrency.icon);
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [{ field: 'code', message: 'Code required' }];

    currencyStoreSpy.subErrors.set(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['code']).toBe('Code required');
    expect(component.getForm.code.hasError('incorrect')).toBe(true);
  });

  it('should not dispatch when form invalid on submit', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.submitData.subscribe(emitSpy);

    // ensure form invalid
    (component.getForm.code as any).setValue(undefined);
    fixture.detectChanges();

    component.submit();

    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('should dispatch createCurrency when in add mode and form valid', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.submitData.subscribe(emitSpy);

    const nameControl = component.getForm.name;
    nameControl.setValue('New Currency');
    nameControl.markAsDirty();
    const codeControl = component.getForm.code;
    codeControl.setValue('New Code');
    codeControl.markAsDirty();
    const iconControl = component.getForm.icon;
    iconControl.setValue('New Icon');
    iconControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        name: 'New Currency',
        code: 'New Code',
        icon: 'New Icon',
      }),
    );
  });

  it('should dispatch updateCurrency when in edit mode and form valid', () => {
    const emitSpy = vi.fn().mockName('emit');
    component.submitData.subscribe(emitSpy);

    fixture.componentRef.setInput('currency', {
      id: '1',
      name: 'Old',
      code: 'old',
      icon: 'Old',
    });
    fixture.detectChanges();

    const nameControl = component.getForm.name;
    nameControl.setValue('Updated Currency');
    nameControl.markAsDirty();
    const codeControl = component.getForm.code;
    codeControl.setValue('Updated Code');
    codeControl.markAsDirty();
    const iconControl = component.getForm.icon;
    iconControl.setValue('Updated Icon');
    iconControl.markAsDirty();

    component.submit();

    expect(component.form.valid).toBe(true);
    expect(emitSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        code: 'Updated Code',
        name: 'Updated Currency',
        icon: 'Updated Icon',
      }),
    );
  });
});
