import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountDialogComponent } from './discount-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { DiscountType, IDiscountAll } from '../discount';
import { IUserAll } from '@app/user/user';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';
import { signal, WritableSignal } from '@angular/core';
import { UserStore } from '@app/store/user.store';
import { provideTranslateService } from '@ngx-translate/core';
describe('DiscountDialogComponent', () => {
  let component: DiscountDialogComponent;
  let fixture: ComponentFixture<DiscountDialogComponent>;

  let customersSignal: WritableSignal<IUserAll[] | undefined>;

  let userStoreSpy: {
    clean: Mock;
    loadCustomers: Mock;
  };
  let dialogRefSpy: Pick<MatDialogRef<DiscountDialogComponent>, 'close'> & {
    close: ReturnType<typeof vi.fn>;
  };

  let mockDiscount: IDiscountAll;

  const mockCustomers: IUserAll[] = [
    { id: 'a', displayName: 'Alice' } as IUserAll,
    { id: 'b', displayName: 'Bob' } as IUserAll,
  ];

  beforeEach(async () => {
    customersSignal = signal<IUserAll[] | undefined>(undefined);

    dialogRefSpy = {
      close: vi.fn().mockName('MatDialogRef.close'),
    };
    userStoreSpy = {
      clean: vi.fn().mockName('UserStore.clean'),
      loadCustomers: vi.fn().mockName('UserStore.loadCustomers'),
    };
    Object.assign(userStoreSpy, {
      customers: customersSignal.asReadonly(),
    });

    mockDiscount = {
      currency: {
        id: '1',
        code: 'EUR',
        name: 'Euro',
        icon: 'euro',
      },
      id: '1',
      name: 'Summer Promo',
      type: DiscountType.percentage,
      amount: 10,
    };

    await TestBed.configureTestingModule({
      imports: [DiscountDialogComponent],
      providers: [
        provideTranslateService(),
        {
          provide: MAT_DIALOG_DATA,
          useFactory: () => ({ discount: mockDiscount }),
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: UserStore, useValue: userStoreSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set title with percentage discount', () => {
    expect(component.title).toBe('10% Summer Promo');
  });

  it('should clean and load customers on init', () => {
    fixture.detectChanges();
    expect(userStoreSpy.clean).toHaveBeenCalled();
    expect(userStoreSpy.loadCustomers).toHaveBeenCalled();
  });

  it('should update allCustomersWritableSignal when store emits', () => {
    customersSignal.set(mockCustomers);
    fixture.detectChanges();

    expect(component.allCustomersWritableSignal()).toEqual(mockCustomers);
  });

  it('should filter customers', () => {
    const result = component['filter']('Ali', mockCustomers);
    expect(result!.length).toBe(1);
    expect(result![0].displayName).toBe('Alice');
  });

  it('should remove a customer', () => {
    component.selectedCustomersSignal.set([mockCustomers[0]]);
    component.allCustomersWritableSignal.set([...mockCustomers]);

    component.remove(mockCustomers[0]);

    expect(component.selectedCustomersSignal().length).toBe(0);
    expect(component.allCustomersWritableSignal()!.length).toBe(3);
  });

  it('should add selected customer and clear input', () => {
    const mockCustomer = { id: '1', displayName: 'Alice' } as IUserAll;

    component.allCustomersWritableSignal.set([
      mockCustomer,
      { id: '2', displayName: 'Bob' } as IUserAll,
    ]);
    fixture.detectChanges();

    component.getForm.customers.setValue = vi.fn().mockName('setValue');
    component.customerInput().nativeElement.value = 'something';

    const mockEvent = {
      option: { value: mockCustomer },
    } as unknown as MatAutocompleteSelectedEvent;

    component.selected(mockEvent);

    expect(component.selectedCustomersSignal()).toContain(mockCustomer);

    expect(component.allCustomersWritableSignal()).toEqual([
      { id: '2', displayName: 'Bob' } as IUserAll,
    ]);

    expect(component.getForm.customers.setValue).toHaveBeenCalledWith(
      undefined,
    );
  });

  it('should close dialog with selected customers', () => {
    component.selectedCustomersSignal.set(mockCustomers);

    component.doAction();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      discountId: mockDiscount.id,
      customerIds: ['a', 'b'],
    });
  });

  it('should close dialog on cancel', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('sortCustomers should sort alphabetically', () => {
    const sorted = component.sortCustomers([
      { id: '2', displayName: 'Beta' } as IUserAll,
      { id: '1', displayName: 'Alpha' } as IUserAll,
    ]);

    expect(sorted![0].displayName).toBe('Alpha');
    expect(sorted![1].displayName).toBe('Beta');
  });
});
