import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormFieldAdderComponent } from './form-field-adder.component';
import { TranslateModule } from '@ngx-translate/core';
import { ICurrencyAll } from '../../interfaces/currency';

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
    }).compileComponents();

    fixture = TestBed.createComponent(FormFieldAdderComponent);
    component = fixture.componentInstance;
    component.currency = currency;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
