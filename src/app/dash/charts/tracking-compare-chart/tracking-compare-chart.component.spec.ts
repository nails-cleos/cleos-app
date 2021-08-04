import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingCompareChartComponent } from './tracking-compare-chart.component';

describe('TrackingCompareChartComponent', () => {
  let component: TrackingCompareChartComponent;
  let fixture: ComponentFixture<TrackingCompareChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackingCompareChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackingCompareChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
