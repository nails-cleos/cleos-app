import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PriceComponent } from './price.component';
import { ICurrency } from '../../interfaces/currency';

describe('PriceComponent', () => {
  let component: PriceComponent;
  let fixture: ComponentFixture<PriceComponent>;

  const mockCurrency: ICurrency = {
    code: 'USD',
    name: 'US Dollar',
    icon: '$',
  };

  const typeForm = {
    type: null,
    bank: null,
    percentage: null,
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PriceComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('typeForm', typeForm);
    fixture.componentRef.setInput('currency', mockCurrency);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
