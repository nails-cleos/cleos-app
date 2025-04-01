import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TimeZoneSnackBarComponent } from './time-zone-snack-bar.component';

describe('TimeZoneSnackBarComponent', () => {
  let component: TimeZoneSnackBarComponent;
  let fixture: ComponentFixture<TimeZoneSnackBarComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
    imports: [TimeZoneSnackBarComponent]
})
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(TimeZoneSnackBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
