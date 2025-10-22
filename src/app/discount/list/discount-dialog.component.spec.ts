import { ComponentFixture, TestBed } from '@angular/core/testing';
import { DiscountDialogComponent } from './discount-dialog.component';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { clean, getAllCustomers } from '../../store/user.actions';
import { DiscountType, IDiscountAll } from '../../interfaces/discount';
import { IUserAll } from '../../interfaces/user';
import { TranslateModule } from '@ngx-translate/core';
import { Subject } from 'rxjs';
import { AppState } from '../../store/app.states';
import { Store } from '@ngrx/store';
import { MatAutocompleteSelectedEvent } from '@angular/material/autocomplete';

describe('DiscountDialogComponent', () => {
  let component: DiscountDialogComponent;
  let fixture: ComponentFixture<DiscountDialogComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<DiscountDialogComponent>>;

  let mockDiscount: IDiscountAll;

  const mockCustomers: IUserAll[] = [
    { id: 'a', displayName: 'Alice' } as IUserAll,
    { id: 'b', displayName: 'Bob' } as IUserAll,
  ];

  beforeEach(async () => {
    state$ = new Subject();

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    storeSpy.select.and.returnValue(state$.asObservable());

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
      imports: [DiscountDialogComponent, TranslateModule.forRoot()],
      providers: [
        {
          provide: MAT_DIALOG_DATA,
          useFactory: () => ({ discount: mockDiscount }),
        },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => state$.complete());

  it('should create component', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should set title with percentage discount', () => {
    expect(component.title).toContain('10 % Summer Promo');
    expect(component.title).toContain(mockDiscount.amount.toString());
  });

  it('should dispatch clean and getAllCustomers on init', () => {
    component.ngOnInit();

    expect(storeSpy.dispatch).toHaveBeenCalledWith(clean());
    expect(storeSpy.dispatch).toHaveBeenCalledWith(getAllCustomers());
  });

  it('should update allCustomers when state changes', () => {
    component.ngOnInit();

    state$.next({ data: mockCustomers });

    expect(component['allCustomers']).toEqual(mockCustomers);
  });

  it('should call detectChanges after view init', () => {
    expect(() => component.ngAfterViewInit()).not.toThrow();
  });

  it('should remove a customer and push it back to allCustomers', () => {
    component.customers = [...mockCustomers];
    component.allCustomers = [];

    component.remove(mockCustomers[0]);

    expect(component.customers.length).toBe(1);
    expect(component.allCustomers?.length).toBe(1);
  });

  it('should filter customers correctly', () => {
    component.allCustomers = mockCustomers;
    const result = component['filter']('Ali');
    expect(result?.length).toBe(1);
    expect(result?.[0].displayName).toBe('Alice');
  });

  it('should close dialog with proper data on doAction', () => {
    component.customers = mockCustomers;
    component['discount'] = mockDiscount;
    component.doAction();
    expect(dialogRefSpy.close).toHaveBeenCalledWith({
      discountId: mockDiscount.id,
      customerIds: ['a', 'b'],
    });
  });

  it('should close dialog on onNoClick', () => {
    component.onNoClick();
    expect(dialogRefSpy.close).toHaveBeenCalled();
  });

  it('should complete destroy$ on ngOnDestroy', () => {
    // Arrange
    component.ngOnInit();

    const destroySpy = spyOn(component['destroy$'], 'next').and.callThrough();
    const completeSpy = spyOn(component['destroy$'], 'complete').and.callThrough();

    // Act
    component.ngOnDestroy();

    // Assert
    expect(destroySpy).toHaveBeenCalledTimes(1);
    expect(completeSpy).toHaveBeenCalledTimes(1);
  });

  it('should initialize with cash discount', () => {
    mockDiscount.type = DiscountType.money;

    fixture = TestBed.createComponent(DiscountDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    expect(component.title).toBe('€ 10 Summer Promo');
  });

  it('should add selected customer and clear input', () => {
    const mockCustomer = { id: '1', displayName: 'Alice' } as IUserAll;
    component.customers = [];
    component.allCustomers = [
      { id: '1', displayName: 'Alice' } as IUserAll,
      { id: '2', displayName: 'Bob' } as IUserAll,
    ];

    const mockInputEl = { value: '' };
    component.customerInput = { nativeElement: mockInputEl } as any;
    component.customerCtrl = { setValue: jasmine.createSpy('setValue') } as any;

    const mockEvent = {
      option: { value: mockCustomer },
    } as unknown as MatAutocompleteSelectedEvent;

    component.selected(mockEvent);

    expect(component.customers).toContain(mockCustomer);
    expect(component.allCustomers).toEqual([{ id: '2', displayName: 'Bob' } as IUserAll]);
    expect(mockInputEl.value).toBe('');
    expect(component.customerCtrl.setValue).toHaveBeenCalledWith(null);
  });

  it('should filter customers based on form input', (done) => {
    component.ngOnInit();

    const mockCustomers = [
      { id: '1', displayName: 'Alice' } as IUserAll,
      { id: '2', displayName: 'Bob' } as IUserAll,
    ];
    component.allCustomers = mockCustomers;

    let emissionCount = 0;
    component.filteredCustomers?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with 'B'
      if (emissionCount === 2) {
        expect(filtered).toEqual([mockCustomers[1]]);
        done();
      }
    });

    // Filter by first letter 'B' which should match USD only
    component.customerCtrl?.setValue('B');
  });

  it('should handle customer object input in filtered options', (done) => {
    component.ngOnInit();
    const mockCustomers = [
      { id: '1', displayName: 'Alice' } as IUserAll,
      { id: '2', displayName: 'Bob' } as IUserAll,
    ];
    state$.next({
      data: mockCustomers,
    });

    let emissionCount = 0;
    component.filteredCustomers?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with currency object
      if (emissionCount === 2) {
        expect(filtered).toEqual([{ id: '1', displayName: 'Alice' } as IUserAll]);
        done();
      }
    });

    component.customerCtrl?.setValue({ id: '1', displayName: 'Alice' } as IUserAll);
  });

  it('should return all customer when filter string is empty', (done) => {
    component.ngOnInit();

    const mockCustomers = [
      { id: '1', displayName: 'Alice' } as IUserAll,
      { id: '2', displayName: 'Bob' } as IUserAll,
    ];
    state$.next({
      data: mockCustomers,
    });

    let emissionCount = 0;
    component.filteredCustomers?.subscribe(filtered => {
      emissionCount++;
      // Skip the first emission (startWith('')) and check the second emission with currency object
      if (emissionCount === 2) {
        expect(filtered).toEqual(mockCustomers);
        done();
      }
    });

    component.customerCtrl?.setValue('');
  });

  it('should sort customers alphabetically by displayName', () => {
    const unsortedCustomers = [
      { id: '2', displayName: 'Bob' } as IUserAll,
      { id: '1', displayName: 'alice' } as IUserAll,
      { id: '5', displayName: 'alice' } as IUserAll,
      { id: '3', displayName: 'Charlie' } as IUserAll,
    ];

    const sorted = component.sortCustomers(unsortedCustomers);

    expect(sorted.map(c => c.displayName)).toEqual(['alice', 'alice', 'Bob', 'Charlie']);
  });
});
