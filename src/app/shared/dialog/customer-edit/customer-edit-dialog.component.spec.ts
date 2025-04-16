import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerEditDialogComponent } from './customer-edit-dialog.component';

describe('CustomerEditReservationDialogComponent', () => {
  let component: CustomerEditDialogComponent;
  let fixture: ComponentFixture<CustomerEditDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CustomerEditDialogComponent],
    })
      .compileComponents();

    fixture = TestBed.createComponent(CustomerEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
