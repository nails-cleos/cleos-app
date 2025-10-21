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

describe('DiscountDialogComponent', () => {
  let component: DiscountDialogComponent;
  let fixture: ComponentFixture<DiscountDialogComponent>;

  let state$: Subject<any>;

  let storeSpy: jasmine.SpyObj<Store<AppState>>;
  let dialogRefSpy: jasmine.SpyObj<MatDialogRef<DiscountDialogComponent>>;

  const mockDiscount = {
    id: '1',
    name: 'Summer Promo',
    type: DiscountType.percentage,
    amount: 10,
  } as IDiscountAll;

  const mockCustomers: IUserAll[] = [
    { id: 'a', displayName: 'Alice' } as IUserAll,
    { id: 'b', displayName: 'Bob' } as IUserAll,
  ];

  beforeEach(async () => {
    state$ = new Subject();

    dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['close']);
    storeSpy = jasmine.createSpyObj('Store', ['select', 'dispatch']);

    storeSpy.select.and.returnValue(state$.asObservable());

    await TestBed.configureTestingModule({
      imports: [DiscountDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: MAT_DIALOG_DATA, useValue: { discount: mockDiscount } },
        { provide: MatDialogRef, useValue: dialogRefSpy },
        { provide: Store, useValue: storeSpy },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(DiscountDialogComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => state$.complete());

  it('should create component', () => {
    expect(component).toBeTruthy();
  });

  it('should set title with percentage discount', () => {
    expect(component.title).toContain('%');
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

  it('should unsubscribe on destroy', () => {
    component.ngOnInit();

    const unsubSpy = spyOn(component['subscription'] || {
      unsubscribe: () => {
      },
    }, 'unsubscribe');
    component.ngOnDestroy();
    expect(unsubSpy).toHaveBeenCalledTimes(1);
  });
});
