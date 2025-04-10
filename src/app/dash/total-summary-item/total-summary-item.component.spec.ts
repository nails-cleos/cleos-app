import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TotalSummaryItemComponent } from './total-summary-item.component';

describe('TotalSummaryItemComponent', () => {
  let component: TotalSummaryItemComponent;
  let fixture: ComponentFixture<TotalSummaryItemComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TotalSummaryItemComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(TotalSummaryItemComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display the correct label', () => {
    component.label = 'Test Label';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.label').textContent).toContain('Test Label');
  });

  it('should display the correct value', () => {
    component.value = 123;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.value').textContent).toContain('123');
  });

  it('should display the correct currency code', () => {
    component.currencyCode = 'USD';
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.currency').textContent).toContain('USD');
  });

  it('should apply the result class when isResult is true', () => {
    component.isResult = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.result')).toBeTruthy();
  });
});
