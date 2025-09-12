import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerEditDialogComponent } from './customer-edit-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';

describe('CustomerEditReservationDialogComponent', () => {
  let component: CustomerEditDialogComponent;
  let fixture: ComponentFixture<CustomerEditDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CustomerEditDialogComponent>>;

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [CustomerEditDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: { } },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
