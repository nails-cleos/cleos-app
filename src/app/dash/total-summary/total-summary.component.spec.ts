import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TotalSummaryComponent } from './total-summary.component';

describe('TotalSummaryComponent', () => {
  let component: TotalSummaryComponent;
  let fixture: ComponentFixture<TotalSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TotalSummaryComponent]
})
      .compileComponents();

    fixture = TestBed.createComponent(TotalSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize showCash to false', () => {
    expect(component.showCash).toBeFalse();
  });
});
