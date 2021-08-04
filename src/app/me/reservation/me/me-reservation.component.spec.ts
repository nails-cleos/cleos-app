import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MeReservationComponent } from './me-reservation.component';

describe('MeReservationComponent', () => {
  let component: MeReservationComponent;
  let fixture: ComponentFixture<MeReservationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ MeReservationComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(MeReservationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
