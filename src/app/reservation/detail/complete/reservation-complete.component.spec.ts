import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReservationCompleteComponent } from './reservation-complete.component';

describe('ReservationCompleteComponent', () => {
  let component: ReservationCompleteComponent;
  let fixture: ComponentFixture<ReservationCompleteComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReservationCompleteComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(ReservationCompleteComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
