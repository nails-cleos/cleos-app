import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { signal } from '@angular/core';

import { CurrencyComponent } from './currency.component';
import { ICurrencyAll } from '../interfaces/currency';
import { CurrencyStore } from '../store/currency.store';
import { NavigationService } from '../services/navigation.service';

describe('CurrencyComponent', () => {
  let component: CurrencyComponent;
  let fixture: ComponentFixture<CurrencyComponent>;

  let currencyStoreSpy: {
    selected: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadById: jasmine.Spy;
    create: jasmine.Spy;
    update: jasmine.Spy;
  };

  const mockCurrency: ICurrencyAll = {
    id: '1',
    name: 'Test Currency',
    code: 'EUR',
    icon: 'euro',
  };

  beforeEach(async () => {
    currencyStoreSpy = {
      selected: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadById: jasmine.createSpy('loadById'),
      create: jasmine.createSpy('create'),
      update: jasmine.createSpy('update'),
    };
    const navigationServiceSpy = jasmine.createSpyObj('NavigationService', ['back']);

    await TestBed.configureTestingModule({
      imports: [CurrencyComponent, TranslateModule.forRoot()],
      providers: [
        { provide: CurrencyStore, useValue: currencyStoreSpy },
        { provide: NavigationService, useValue: navigationServiceSpy },
      ],
    }).compileComponents();

    const translateService = TestBed.inject(TranslateService);
    translateService.use('en-GB');

    fixture = TestBed.createComponent(CurrencyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should dispatch getCurrency when currencyId emits a value', () => {
    currencyStoreSpy.loadById.calls.reset();
    fixture.componentRef.setInput('id', '123');
    fixture.detectChanges();

    expect(currencyStoreSpy.loadById).toHaveBeenCalledWith('123');
  });

  it('should patch form when selectedCurrency emits', () => {
    currencyStoreSpy.selected.set(mockCurrency);
    fixture.detectChanges();

    expect(component.getForm.code.value).toBe(mockCurrency.code);
    expect(component.getForm.name.value).toBe(mockCurrency.name);
    expect(component.getForm.icon.value).toBe(mockCurrency.icon);
  });

  it('should handle form errors from subErrorsSignal', () => {
    const errors = [
      { field: 'code', message: 'Code required' },
    ];

    currencyStoreSpy.subErrors.set(errors);
    fixture.detectChanges();

    const errs = component.errors();
    expect(errs['code']).toBe('Code required');
    expect(component.getForm.code.hasError('incorrect')).toBeTrue();
  });

  it('should not dispatch when form invalid on submit', () => {
    currencyStoreSpy.create.calls.reset();
    currencyStoreSpy.update.calls.reset();

    // ensure form invalid
    (component.getForm.code as any).setValue(undefined);
    fixture.detectChanges();

    component.submit();

    expect(currencyStoreSpy.create).not.toHaveBeenCalled();
    expect(currencyStoreSpy.update).not.toHaveBeenCalled();
  });

  it('should dispatch createCurrency when in add mode and form valid', () => {
    currencyStoreSpy.create.calls.reset();

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

    expect(component.form.valid).toBeTrue();
    expect(currencyStoreSpy.create).toHaveBeenCalledWith(jasmine.objectContaining({
      name: 'New Currency',
      code: 'New Code',
      icon: 'New Icon',
    }));
  });

  it('should dispatch updateCurrency when in edit mode and form valid', () => {
    currencyStoreSpy.update.calls.reset();

    fixture.componentRef.setInput('id', 'abc-123');
    fixture.detectChanges();
    currencyStoreSpy.selected.set({ name: 'Old', code: 'old', icon: 'Old' });
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

    expect(component.form.valid).toBeTrue();
    expect(currencyStoreSpy.update).toHaveBeenCalledWith('abc-123', jasmine.objectContaining({
      code: 'Updated Code',
      name: 'Updated Currency',
      icon: 'Updated Icon',
    }));
  });
});
