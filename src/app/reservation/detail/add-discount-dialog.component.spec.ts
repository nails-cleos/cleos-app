import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddDiscountDialogComponent } from './add-discount-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { cleanDiscount, getUserDiscountByCustomerId } from '../../store/discount.actions';
import { DiscountState } from '../../store/reducers/discount.reducers';
import { TranslateModule } from '@ngx-translate/core';

describe('AddDiscountDialogComponent', () => {
  let component: AddDiscountDialogComponent;
  let fixture: ComponentFixture<AddDiscountDialogComponent>;
  let store: MockStore<DiscountState>;
  let dialogRef: jasmine.SpyObj<MatDialogRef<AddDiscountDialogComponent>>;

  const dialogData = {
    customerId: 'customer-123',
  };

  beforeEach(async () => {
    dialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);

    await TestBed.configureTestingModule({
      imports: [
        AddDiscountDialogComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideMockStore(),
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

    store = TestBed.inject(MockStore);
    spyOn(store, 'dispatch');

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

  it('should dispatch cleanDiscount and getUserDiscountByCustomerId on init', () => {
    expect(store.dispatch).toHaveBeenCalledWith(cleanDiscount());
    expect(store.dispatch).toHaveBeenCalledWith(getUserDiscountByCustomerId({ customerId: 'customer-123' }));
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
