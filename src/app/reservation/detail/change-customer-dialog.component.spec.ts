import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ChangeCustomerDialogComponent } from './change-customer-dialog.component';
import { IUserAll } from '@app/user/user';
import { signal, WritableSignal } from '@angular/core';
import { UserStore } from '@app/store/user.store';
import { provideTranslateService } from '@ngx-translate/core';
describe('ChangeCustomerDialogComponent', () => {
  let component: ChangeCustomerDialogComponent;
  let fixture: ComponentFixture<ChangeCustomerDialogComponent>;

  let customersSignal: WritableSignal<IUserAll[] | undefined>;

  let userStoreSpy: {
    clean: Mock;
    loadCustomers: Mock;
  };
  let dialogRefSpy: Pick<
    MatDialogRef<ChangeCustomerDialogComponent>,
    'close'
  > & {
    close: ReturnType<typeof vi.fn>;
  };

  const mockChangeCustomer = {
    treatmentId: 'treatment1',
    small: true,
  };

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

    await TestBed.configureTestingModule({
      imports: [ChangeCustomerDialogComponent],
      providers: [
        provideTranslateService(),
        {
          provide: MAT_DIALOG_DATA,
          useFactory: () => mockChangeCustomer,
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: UserStore, useValue: userStoreSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeCustomerDialogComponent);
    component = fixture.componentInstance;
  });

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should clean and load customers on init', () => {
    fixture.detectChanges();
    expect(userStoreSpy.clean).toHaveBeenCalled();
    expect(userStoreSpy.loadCustomers).toHaveBeenCalled();
  });

  it('should update customersWritableSignal when store emits', () => {
    customersSignal.set(mockCustomers);
    fixture.detectChanges();

    expect(component.customersSignal()).toEqual(mockCustomers);
  });

  it('should filter customers', () => {
    const result = component['filterCustomer']('Bo', mockCustomers);
    expect(result!.length).toBe(1);
    expect(result![0].displayName).toBe('Bob');
  });

  it('should close dialog with selected customers', () => {
    component.getForm.customer.setValue(mockCustomers[0]);

    component.doAction();

    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      customerId: mockCustomers[0].id,
    });
  });

  it('should close dialog on cancel', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should clear customer form control when keyDownHandler is called with Backspace', () => {
    component.getForm.customer.setValue(mockCustomers[0]);

    component.keyDownHandler({ code: 'Backspace' } as KeyboardEvent);

    expect(component.getForm.customer.value).toBe(undefined);
  });
});
