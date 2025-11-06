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

  it('should apply the result class when isResult is true', () => {
    component.isResult = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.result')).toBeTruthy();
  });
});
