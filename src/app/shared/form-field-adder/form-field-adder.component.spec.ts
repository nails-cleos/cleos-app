import { ComponentFixture, fakeAsync, TestBed, tick } from '@angular/core/testing';
import { FormFieldAdderComponent } from './form-field-adder.component';
import { FormBuilder } from '@angular/forms';
import { PaymentType } from '../../interfaces/payment';
import { ICurrencyAll } from '../../interfaces/currency';
import { TranslateModule } from '@ngx-translate/core';

describe('FormFieldAdderComponent', () => {
  let component: FormFieldAdderComponent;
  let fixture: ComponentFixture<FormFieldAdderComponent>;

  const currency = {
    code: 'EUR',
    name: 'EURO',
  } as ICurrencyAll;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldAdderComponent, TranslateModule.forRoot()],
      providers: [FormBuilder],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldAdderComponent);
    component = fixture.componentInstance;
    component.currency = currency;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize form and columns on ngOnInit', () => {
    component.split = true;
    component.ngOnInit();
    expect(component.formGroup).toBeDefined();
    expect(component.displayedColumns).toContain('paymentType');
    expect(component.displayedColumns).toContain('actions');
  });

  it('should add a row and subscribe to value changes', fakeAsync(() => {
    spyOn(component as any, 'emitRowChange');
    component.split = true;
    component.ngOnInit();

    component.addRow();

    expect(component.dataSource.data.length).toBe(1);
    const fg = component.getFormGroup(0);
    fg.get('description')?.setValue('Test');
    fg.get('price')?.setValue(100);
    fg.get('paymentType')?.setValue(PaymentType.transfer);

    tick(300);
    expect(component['emitRowChange']).toHaveBeenCalled();
    expect(component.total()).toBe(100);
  }));

  it('should delete a row and emit changes', () => {
    component.split = false;
    component.ngOnInit();
    component.addRow();

    expect(component.dataSource.data.length).toBe(1);

    const spy = spyOn(component as any, 'emitRowChange');
    component.deleteRow(0);

    expect(component.dataSource.data.length).toBe(0);
    expect(spy).toHaveBeenCalled();
  });

  it('should calculate total correctly', fakeAsync(() => {
    component.split = false;
    component.ngOnInit();
    component.addRow();
    const fg = component.getFormGroup(0);
    fg.get('price')?.setValue(50);

    tick(300);
    fixture.detectChanges();
    expect(component.total()).toBe(50);
  }));

  it('should calculate remainsToBeSplit correctly', fakeAsync(() => {
    component.split = true;
    component.toPaid = 200;
    component.ngOnInit();

    component.addRow();
    const fg = component.getFormGroup(0);
    fg.get('price')?.setValue(50);

    tick(300);
    fixture.detectChanges();
    expect(component.remainsToBeSplit()).toBe(150);
  }));

  it('should calculate remainsToBeSplit correctly when toPaid is undefined', fakeAsync(() => {
    component.split = true;
    component.toPaid = undefined;
    component.ngOnInit();

    component.addRow();
    const fg = component.getFormGroup(0);
    fg.get('price')?.setValue(50);

    tick(300);
    fixture.detectChanges();
    expect(component.remainsToBeSplit()).toBe(-50);
  }));

  it('should not calculate remainsToBeSplit if split is false', () => {
    component.split = false;
    component.toPaid = 200;
    const result = component['remainsToBeSplit']();
    expect(result).toBe(null);
  });

  it('should emit onChange and isValid correctly', () => {
    component.split = false;
    component.ngOnInit();
    component.addRow();

    const onChangeSpy = spyOn(component.onChange, 'emit');
    const isValidSpy = spyOn(component.isValid, 'emit');

    component['emitRowChange']();
    expect(onChangeSpy).not.toHaveBeenCalled();
    expect(isValidSpy).toHaveBeenCalledWith(false);

    const fg = component.getFormGroup(0);
    fg.get('description')?.setValue('Test desc');
    fg.get('price')?.setValue(100);

    component['emitRowChange']();
    expect(onChangeSpy).toHaveBeenCalledWith(component.dataSource.data);
    expect(isValidSpy).toHaveBeenCalledWith(true);

    component.split = true;
    component.toPaid = 100;
    component['emitRowChange']();
    expect(isValidSpy).toHaveBeenCalledWith(true);

    component.dataSource.data[0].price = 50;
    component['emitRowChange']();
    expect(isValidSpy).toHaveBeenCalledWith(false);
  });

});
