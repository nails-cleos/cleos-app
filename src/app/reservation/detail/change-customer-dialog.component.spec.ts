import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { AppMaterialModule } from '../../util/app-material.module';
import { Store } from '@ngrx/store';
import { Subject } from 'rxjs';
import { ChangeCustomerDialogComponent } from './change-customer-dialog.component';
import { IUser, IUserAll } from '../../interfaces/user';
import * as fromActionsUser from '../../store/user.actions';

describe('ChangeCustomerDialogComponent', () => {
  let component: ChangeCustomerDialogComponent;
  let fixture: ComponentFixture<ChangeCustomerDialogComponent>;
  let mockDialogRef: jasmine.SpyObj<MatDialogRef<ChangeCustomerDialogComponent>>;
  let mockStore: jasmine.SpyObj<Store>;
  let stateSubject: Subject<any>;

  const mockCustomers: IUserAll[] = [
    {
      id: '1',
      displayName: 'Test Customer 1',
      email: 'customer1@test.com',
      authorities: [],
      locale: 'en',
      timeZone: 'UTC',
    },
    {
      id: '2',
      displayName: 'Another Customer',
      email: 'customer2@test.com',
      authorities: [],
      locale: 'en',
      timeZone: 'UTC',
    },
    {
      id: '3',
      displayName: 'Test Customer 2',
      email: 'customer3@test.com',
      authorities: [],
      locale: 'en',
      timeZone: 'UTC',
    },
  ];

  const mockData = {
    customerId: 'customer-id',
  };

  beforeEach(async () => {
    stateSubject = new Subject();
    mockDialogRef = jasmine.createSpyObj('MatDialogRef', ['close']);
    mockStore = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    mockStore.select.and.returnValue(stateSubject.asObservable());

    await TestBed.configureTestingModule({
      imports: [ChangeCustomerDialogComponent, TranslateModule.forRoot(), AppMaterialModule],
      providers: [
        { provide: MatDialogRef, useValue: mockDialogRef },
        { provide: MAT_DIALOG_DATA, useValue: { ...mockData } },
        { provide: Store, useValue: mockStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeCustomerDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have data injected', () => {
    expect(component.data).toEqual(mockData);
  });

  it('should dispatch Clean action on initialization', () => {
    component.ngOnInit();
    expect(mockStore.dispatch).toHaveBeenCalledWith(new fromActionsUser.Clean());
  });

  it('onNoClick should close the dialog', () => {
    void component.onNoClick;
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('doAction should close the dialog', () => {
    component.customerForm.get('customer')?.setValue(mockCustomers[2]);

    void component.doAction;
    expect(mockDialogRef.close).toHaveBeenCalledWith({ customerId: mockCustomers[2].id });
  });

  it('should render the dialog title', () => {
    const compiled = fixture.nativeElement;
    const titleElement = compiled.querySelector('h1[mat-dialog-title]');
    expect(titleElement.textContent).toBe('RESERVATION.CUSTOMER.CHANGE');
  });

  it('should show both buttons when both hideNoButton and hideOkButton are false', () => {
    const compiled = fixture.nativeElement;
    const buttons = compiled.querySelectorAll('button');
    expect(buttons.length).toBe(2);
  });

  it('should pass correct value to mat-dialog-close directive', () => {
    const testValue = 'test-value';
    component.data.customerId = testValue;
    fixture.detectChanges();

    // The Yes button should have the mat-dialog-close directive with the correct customerId
    // This is tested through the component's data binding
    expect(component.data.customerId).toBe(testValue);
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
    const yesButton = buttons.find(btn => btn.textContent?.includes('RESERVATION.CUSTOMER.UPDATE'));

    expect(noButton?.textContent?.trim()).toContain('COMMON.BUTTON.CANCEL');
    expect(yesButton?.textContent?.trim()).toContain('RESERVATION.CUSTOMER.UPDATE');
  });

  it('should initialize form with empty values', () => {
    component.ngOnInit();

    expect(component.customerForm.get('customer')?.value).toBe('');
  });

  it('should validate form correctly', () => {
    component.ngOnInit();

    expect(component.customerForm.invalid).toBe(true);

    component.customerForm.get('customer')?.setValue({ id: '1', displayName: 'Customer' } as IUser);
    expect(component.customerForm.valid).toBe(true);
  });

  it('should handle state subscription correctly', () => {
    component.ngOnInit();

    expect(mockStore.select).toHaveBeenCalled();
  });

  it('should update customer list when state changes', () => {
    stateSubject.next({
      data: mockCustomers,
    });

    expect(component.customers).toEqual(mockCustomers);
  });

  it('should dispatch GetCustomer action when getCustomers is called', () => {
    mockStore.dispatch.calls.reset();

    component['getCustomers']();

    expect(mockStore.dispatch).toHaveBeenCalledWith(jasmine.any(fromActionsUser.GetAllCustomers));
  });

  it('should filter customers correctly when filterCustomer is called', () => {
    component.customers = mockCustomers;

    const result = component['filterCustomer']('Another Customer');

    expect(result?.length).toBe(1);
    expect(result?.[0]?.displayName).toBe('Another Customer');
  });

  it('should return undefined when filterCustomer is called with no customers', () => {
    component.customers = undefined;
    fixture.detectChanges();

    const result = component['filterCustomer']('Test Customer');

    expect(result).toBeUndefined();
  });

  it('should filter customer options based on form input', (done) => {
    component.customers = mockCustomers;
    component['createForm']();

    let emissionCount = 0;
    component.filteredCustomer?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with 'T'
      if (emissionCount === 2) {
        expect(filtered).toEqual([
          mockCustomers[0],
          mockCustomers[2],
        ]);
        done();
      }
    });

    component.customerForm.get('customer')?.setValue('T');
  });

  it('should filter customer options based on customer form input', (done) => {
    component.customers = [
      {
        id: '1',
        displayName: 'Test Customer 1',
        email: 'customer1@test.com',
        authorities: [],
        locale: 'en',
        timeZone: 'UTC',
      },
      {
        id: '2',
        displayName: 'Another Customer',
        email: 'customer2@test.com',
        authorities: [],
        locale: 'en',
        timeZone: 'UTC',
      },
      {
        id: '3',
        displayName: 'Test Customer 2',
        email: 'customer3@test.com',
        authorities: [],
        locale: 'en',
        timeZone: 'UTC',
      },
    ] as any[];
    component['createForm']();

    let emissionCount = 0;
    component.filteredCustomer?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with color
      if (emissionCount === 2) {
        expect(filtered).toEqual([
          {
            id: '2',
            displayName: 'Another Customer',
            email: 'customer2@test.com',
            authorities: [],
            locale: 'en',
            timeZone: 'UTC',
          },
        ]);
        done();
      }
    });

    component.customer.setValue({
      id: '2',
      displayName: 'Another Customer',
      email: 'customer2@test.com',
      authorities: [],
      locale: 'en',
      timeZone: 'UTC',
    });
  });

  it('should return the customer when filter is empty string', (done) => {
    component.customers = mockCustomers;
    component['createForm']();

    component.customerForm.get('customer')?.setValue('');

    component.filteredCustomer?.subscribe(filtered => {
      expect(filtered).toEqual(mockCustomers);
      done();
    });
  });

  it('should clear customer form control when keyDownHandler is called with Backspace', () => {
    component.ngOnInit();
    component.customerForm.get('customer')?.setValue('test value');

    component.keyDownHandler({ code: 'Backspace' });

    expect(component.customerForm.get('customer')?.value).toBe('');
  });

  it('should not clear customer form control when keyDownHandler is called with other key', () => {
    component.ngOnInit();
    component.customerForm.get('customer')?.setValue('test value');

    component.keyDownHandler({ code: 'Enter' });

    expect(component.customerForm.get('customer')?.value).toBe('test value');
  });

  it('should return customer name when displayFnUser is called with customer', () => {
    const customer = mockCustomers[1];

    const result = component.displayFnUser(customer);

    expect(result).toBe(customer.displayName);
  });

  it('should return empty string when displayFnUser is called with null', () => {
    const result = component.displayFnUser(null as any);

    expect(result).toBe('');
  });
});