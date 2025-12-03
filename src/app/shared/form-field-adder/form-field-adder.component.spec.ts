import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FormFieldAdderComponent } from './form-field-adder.component';
import { PaymentType } from '../../interfaces/payment';
import { TranslateModule } from '@ngx-translate/core';

describe('FormFieldAdderComponent', () => {
  let component: FormFieldAdderComponent;
  let fixture: ComponentFixture<FormFieldAdderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FormFieldAdderComponent, TranslateModule.forRoot()],
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldAdderComponent);
    component = fixture.componentInstance;

    // Provide required inputs
    fixture.componentRef.setInput('allPaymentTypes', [PaymentType.cash, PaymentType.transfer]);
    fixture.componentRef.setInput('key', 'test');
    fixture.componentRef.setInput('currency', { code: 'EUR', icon: '€' });
    fixture.componentRef.setInput('split', false);
    fixture.componentRef.setInput('toPaid', 100);

    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should add a row', () => {
    expect(component['formArray'].length).toBe(0);
    component.addRow();
    fixture.detectChanges();
    expect(component['formArray'].length).toBe(1);

    const row = component['formArray'].at(0).value;
    expect(row.description).toBe('');
    expect(row.price).toBe(0);
  });

  it('should delete a row', () => {
    component.addRow();
    component.addRow();
    fixture.detectChanges();

    expect(component['formArray'].length).toBe(2);
    component.deleteRow(0);
    fixture.detectChanges();

    expect(component['formArray'].length).toBe(1);
  });

  it('should update extras on updateExtra', () => {
    component.addRow();
    fixture.detectChanges();

    const group = component.getFormGroup(0);
    group.controls.description.setValue('Test description');
    group.controls.price.setValue(42);

    component.updateExtra(0);

    const extras = component.extras();
    expect(extras.length).toBe(1);
    expect(extras[0].description).toBe('Test description');
    expect(extras[0].price).toBe(42);
  });

  it('should emit onChange and isValid', () => {
    spyOn(component.onChange, 'emit');
    spyOn(component.isValid, 'emit');

    component.addRow();
    fixture.detectChanges();

    const group = component.getFormGroup(0);
    group.controls.description.setValue('A');
    group.controls.price.setValue(10);

    component.updateExtra(0);
    fixture.detectChanges();

    expect(component.onChange.emit).toHaveBeenCalledWith(component.extras());
    expect(component.isValid.emit).toHaveBeenCalledWith(true);
  });

  it('should calculate total correctly', () => {
    component.addRow();
    component.addRow();

    const group1 = component.getFormGroup(0);
    const group2 = component.getFormGroup(1);

    group1.controls.price.setValue(30);
    group2.controls.price.setValue(20);

    component.updateExtra(0);
    component.updateExtra(1);

    expect(component.total()).toBe(50);
  });
});
