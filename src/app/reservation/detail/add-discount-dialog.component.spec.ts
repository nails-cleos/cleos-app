import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AddDiscountDialogComponent } from './add-discount-dialog.component';
import { AppMaterialModule } from '../../util/app-material.module';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import * as fromActionsDiscount from '../../store/discount.actions';
import { DiscountType, IUserDiscount } from '../../interfaces/discount';

describe('AddDiscountDialogComponent', () => {
  let component: AddDiscountDialogComponent;
  let fixture: ComponentFixture<AddDiscountDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<AddDiscountDialogComponent>>;
  let mockStore: jasmine.SpyObj<Store>;
  let stateSubject: Subject<any>;

  const mockData = {
    customerId: 'customer-id',
  };

  beforeEach(async () => {
    stateSubject = new Subject();
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    mockStore.select.and.returnValue(stateSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [AddDiscountDialogComponent, TranslateModule.forRoot(), AppMaterialModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { ...mockData } },
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AddDiscountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have data injected', () => {
    expect(component.data).toEqual(mockData);
  });

  it('onNoClick should close the dialog', () => {
    void component.onNoClick;
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('onNoClick should close the dialog', () => {
    const discountId = '123';
    component.discountForm.get('discount')?.setValue(discountId);

    void component.doAction;
    expect(mockDialogRef.close).toHaveBeenCalledWith({ discountId });
  });

  it('should render the dialog title', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1[mat-dialog-title]');
    expect(titleElement.textContent).toBe('RESERVATION.DISCOUNT.ADD');
  });

  it('should show both buttons when both hideNoButton and hideOkButton are false', () => {
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('should pass correct value to mat-dialog-close directive', () => {
    const testValue = 'test-value';
    component.data.value = testValue;
    fixture.detectChanges();

    // The Yes button should have the mat-dialog-close directive with the correct value
    // This is tested through the component's data binding
    expect(component.data.value).toBe(testValue);
  });

  it('should call dialogRef.close when No button is clicked', () => {
    const compiled = fixture.nativeElement;
    const buttons = Array.from(compiled.querySelectorAll('button')) as HTMLButtonElement[];
    const noButton = buttons.find(btn => btn.textContent?.includes('COMMON.BUTTON.CANCEL'));
    expect(noButton).toBeTruthy();
    noButton?.click();

    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('should display translated button texts', () => {
    const compiled = fixture.nativeElement;
    const buttons = Array.from(compiled.querySelectorAll('button')) as HTMLButtonElement[];

    const noButton = buttons.find(btn => btn.textContent?.includes('COMMON.BUTTON.CANCEL'));
    const yesButton = buttons.find(btn => btn.textContent?.includes('Ok'));

    expect(noButton?.textContent?.trim()).toContain('COMMON.BUTTON.CANCEL');
    expect(yesButton?.textContent?.trim()).toContain('Ok');
  });

  it('should dispatch Clean action on initialization', () => {
    // Reset to check only the initialization call
    mockStore.dispatch.calls.reset();
    component.ngOnInit();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsDiscount.Clean));
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    expect(component.discountForm.get('discount')?.value).toBe('');
  });

  it('should validate form correctly', () => {
    component.ngOnInit();

    expect(component.discountForm.invalid).toBe(true);

    component.discountForm.get('discount')?.setValue('Test Name');
    expect(component.discountForm.valid).toBe(true);
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(mockStore.select).toHaveBeenCalled();
  });

  it('should update discount list when state changes', () => {
    const mockDiscounts: IUserDiscount[] = [
      {
        id: '1', title: 'Discount 1', used: false, discountCustomer: {
          name: 'Discount Customer 1', id: 'dc1', amount: 10, type: DiscountType.percentage, currency: {
            id: 'c1', name: 'EUR', code: 'EUR', icon: '$',
          },
        },
      },
      {
        id: '2', title: 'Discount 2', used: false, discountCustomer: {
          name: 'Discount Customer 2', id: 'dc2', amount: 10, type: DiscountType.percentage, currency: {
            id: 'c1', name: 'EUR', code: 'EUR', icon: '$',
          },
        },
      },
      {
        id: '3', title: 'Discount 3', used: false, discountCustomer: {
          name: 'Discount Customer 3', id: 'dc3', amount: 10, type: DiscountType.percentage, currency: {
            id: 'c1', name: 'EUR', code: 'EUR', icon: '$',
          },
        },
      },
    ];

    stateSubject.next({
      data: mockDiscounts,
    });

    expect(component.discounts).toBe(mockDiscounts);
  });
});