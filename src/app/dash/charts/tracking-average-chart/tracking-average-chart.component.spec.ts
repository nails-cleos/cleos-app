import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TrackingAverageChartComponent } from './tracking-average-chart.component';

describe('TrackingAverageChartComponent', () => {
  let component: TrackingAverageChartComponent;
  let fixture: ComponentFixture<TrackingAverageChartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ TrackingAverageChartComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TrackingAverageChartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
