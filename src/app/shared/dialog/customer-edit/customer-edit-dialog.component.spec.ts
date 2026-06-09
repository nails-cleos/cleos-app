import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CustomerEditDialogComponent } from './customer-edit-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { Price } from '../../../treatment/treatment';

describe('CustomerEditReservationDialogComponent', () => {
  let component: CustomerEditDialogComponent;
  let fixture: ComponentFixture<CustomerEditDialogComponent>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<CustomerEditDialogComponent>>;

  const mockData = {
    price: new Price(100, 0, 10, 5, 115, 0, 115, 100, 110, 105, 100, 0),
    currency: { id: 'EUR', code: 'EUR', icon: '€', name: 'Euro' },
  };

  beforeEach(async () => {
    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [CustomerEditDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: MAT_DIALOG_DATA, useValue: mockData },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(CustomerEditDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize price and currency from data', () => {
    expect(component.price).toEqual(mockData.price);
    expect(component.currency).toEqual(mockData.currency);
  });

  it('should close dialog with no data on onNoClick', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalledWith();
  });

  it('should close dialog with true on doAction', () => {
    component.doAction();
    expect(dialogRefSpy.close).toHaveBeenCalledWith(true);
  });
});

