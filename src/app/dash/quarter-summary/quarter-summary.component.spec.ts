import { ComponentFixture, TestBed } from '@angular/core/testing';

import { QuarterSummaryComponent } from './quarter-summary.component';

describe('QuarterSummaryComponent', () => {
  let component: QuarterSummaryComponent;
  let fixture: ComponentFixture<QuarterSummaryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [QuarterSummaryComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(QuarterSummaryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
