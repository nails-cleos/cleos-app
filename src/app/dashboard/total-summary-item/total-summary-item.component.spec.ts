import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TotalSummaryItemComponent } from './total-summary-item.component';
import { ICurrencyAll } from '@app/currency/currency';

describe('TotalSummaryItemComponent', () => {
  let component: TotalSummaryItemComponent;
  let fixture: ComponentFixture<TotalSummaryItemComponent>;

  const mockCurrency: ICurrencyAll = {
    id: '1',
    name: 'Euro',
    code: 'EUR',
    icon: '€',
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalSummaryItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TotalSummaryItemComponent);
    component = fixture.componentInstance;

    fixture.componentRef.setInput('label', 'Gross');
    fixture.componentRef.setInput('value', 1000);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.total-summary-item__value').textContent).toContain('$1,000.00');
    expect(component.label()).toBe('Gross');
    expect(component.value()).toBe(1000);
    expect(component.isResult()).toBeFalse();
    expect(component.currencyCode()).toBeUndefined();
  });

  it('should apply the result class when isResult is true', () => {
    fixture.componentRef.setInput('isResult', true);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.total-summary-item--result')).toBeTruthy();
    expect(component.isResult()).toBeTrue();
  });

  it('should display the correct currency code when provided', () => {
    fixture.componentRef.setInput('currencyCode', mockCurrency.code);
    fixture.detectChanges();

    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.total-summary-item__value').textContent).toContain('€1,000.00');
    expect(component.currencyCode()).toBe('EUR');
  });
});
