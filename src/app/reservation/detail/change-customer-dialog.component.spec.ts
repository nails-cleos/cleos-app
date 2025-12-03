import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { TranslateModule } from '@ngx-translate/core';
import { BehaviorSubject } from 'rxjs';
import { Store } from '@ngrx/store';
import { ChangeCustomerDialogComponent } from './change-customer-dialog.component';
import { ReservationState } from '../../store/reducers/reservation.reducers';
import { IUserAll } from '../../interfaces/user';
import { getAllCustomers } from '../../store/user.actions';

describe('ChangeCustomerDialogComponent', () => {
  let component: ChangeCustomerDialogComponent;
  let fixture: ComponentFixture<ChangeCustomerDialogComponent>;

  let customers$: BehaviorSubject<IUserAll[] | undefined>;

  let storeSpy: jasmine.SpyObj<Store<ReservationState>>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<ChangeCustomerDialogComponent>>;

  const mockChangeCustomer = {
    treatmentId: 'treatment1',
    small: true,
  };

  const mockCustomers: IUserAll[] = [
    { id: 'a', displayName: 'Alice' } as IUserAll,
    { id: 'b', displayName: 'Bob' } as IUserAll,
  ];

  beforeEach(async () => {
    customers$ = new BehaviorSubject<IUserAll[] | undefined>(undefined);

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    storeSpy = jasmine.createSpyObj('Store', ['pipe', 'dispatch']);
    storeSpy.pipe.and.returnValue(customers$.asObservable());

    await TestBed.configureTestingModule({
      imports: [ChangeCustomerDialogComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useFactory: () => (mockChangeCustomer),
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ChangeCustomerDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => customers$.complete());

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should dispatch clean and getAllCustomers on init', () => {
    fixture.detectChanges();
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllCustomers());
  });

  it('should update customersWritableSignal when store emits', () => {
    customers$.next(mockCustomers);
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

    expect(dialogRefSpy.close).toHaveBeenCalledWith({ customerId: mockCustomers[0].id });
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
