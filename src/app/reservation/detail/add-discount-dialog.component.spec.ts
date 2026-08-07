import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddDiscountDialogComponent } from './add-discount-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { signal } from '@angular/core';
import { DiscountStore } from '@app/store/discount.store';
import { provideTranslateService } from "@ngx-translate/core";

describe('AddDiscountDialogComponent', () => {
  let component: AddDiscountDialogComponent;
  let fixture: ComponentFixture<AddDiscountDialogComponent>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AddDiscountDialogComponent>>;
  let discountStoreSpy: {
    data: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadUserDiscounts: jasmine.Spy;
  };

  const dialogData = {
    customerId: 'customer-123',
  };

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    discountStoreSpy = {
      data: signal<any>(undefined),
      clean: jasmine.createSpy('clean'),
      loadUserDiscounts: jasmine.createSpy('loadUserDiscounts'),
    };

    await TestBed.configureTestingModule({
      imports: [AddDiscountDialogComponent],
      providers: [
        provideTranslateService(),
        { provide: DiscountStore, useValue: discountStoreSpy },
        {
          provide: MAT_DIALOG_DATA,
          useValue: dialogData,
        },
        {
          provide: MatDialogRef,
          useValue: dialogRef,
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDiscountDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges(); // triggers constructor + effect
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should initialize the form with empty discount', () => {
    expect(component.form).toBeDefined();
    expect(component.getForm.discount.value).toBe('');
    expect(component.getForm.discount.valid).toBeFalse();
  });

  it('should compute customerId from dialog data', () => {
    expect(component.customerId()).toBe('customer-123');
  });

  it('should load user discounts on init', () => {
    expect(discountStoreSpy.clean).toHaveBeenCalled();
    expect(discountStoreSpy.loadUserDiscounts).toHaveBeenCalledWith('customer-123');
  });

  it('onNoClick should close the dialog without data', () => {
    component.onNoClick();

    expect(dialogRef.close).toHaveBeenCalledWith();
  });

  it('doAction should close the dialog with discountId', () => {
    component.getForm.discount.setValue('discount-456');

    component.doAction();

    expect(dialogRef.close).toHaveBeenCalledWith({ discountId: 'discount-456' });
  });
});
