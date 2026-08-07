import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpenseDetailsPageComponent } from './expense-details-page.component';
import { ExpenseStore } from '@app/store/expense.store';
import { IExpense } from './expense';
import { ExpenseComponent } from './expense.component';
import { AwsStore } from '@app/store/aws.store';
import { AuthUserService } from '@app/services/auth-user.service';
import { DriveAccessService } from '@app/services/drive-access.service';
import { NavigationService } from '@app/services/navigation.service';
import { TokenService } from '@app/services/token.service';
import { provideAppDateAdapter } from '@app/util/adapter/app-date.provider';
import { provideTranslateService } from '@ngx-translate/core';

describe('ExpenseDetailsPageComponent', () => {
  let component: ExpenseDetailsPageComponent;
  let fixture: ComponentFixture<ExpenseDetailsPageComponent>;

  let expenseStoreSpy: {
    selected: ReturnType<typeof signal>;
    info: ReturnType<typeof signal>;
    subErrors: ReturnType<typeof signal>;
    response: ReturnType<typeof signal>;
    error: ReturnType<typeof signal>;
    isLoading: ReturnType<typeof signal>;
    clean: jasmine.Spy;
    loadInfo: jasmine.Spy;
    loadById: jasmine.Spy;
    update: jasmine.Spy;
  };

  const roomId = '1234';
  const id = '123';

  const mockExpense: IExpense = {
    id,
    invoice: 'Test Expense',
    description: 'Test Description',
  };

  beforeEach(async () => {
    expenseStoreSpy = {
      selected: signal<any>(undefined),
      info: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      response: signal<any>(undefined),
      error: signal<any>(undefined),
      isLoading: signal(false),
      clean: jasmine.createSpy('clean'),
      loadInfo: jasmine.createSpy('loadInfo'),
      loadById: jasmine.createSpy('loadById'),
      update: jasmine.createSpy('update'),
    };

    await TestBed.configureTestingModule({
      imports: [ExpenseDetailsPageComponent],
      providers: [
        provideTranslateService(),
        { provide: ExpenseStore, useValue: expenseStoreSpy },
        {
          provide: AwsStore,
          useValue: { data: signal(undefined), processPdf: jasmine.createSpy('processPdf'), clean: jasmine.createSpy('clean') },
        },
        { provide: AuthUserService, useValue: { authUser: signal({ userId: 'user-1' }) } },
        { provide: DriveAccessService, useValue: { requestAccessIfNeeded: jasmine.createSpy('requestAccessIfNeeded') } },
        { provide: NavigationService, useValue: { back: jasmine.createSpy('back') } },
        { provide: TokenService, useValue: { token: signal('token') } },
        provideAppDateAdapter(),
      ],
    }).overrideTemplate(ExpenseComponent, '')
      .overrideTemplate(ExpenseDetailsPageComponent, `
        @if (expense(); as expense) {
          <app-expense [roomId]="id()" [expense]="expense" [config]="config" />
        }
      `)
      .compileComponents();

    fixture = TestBed.createComponent(ExpenseDetailsPageComponent);

    fixture.componentRef.setInput('id', roomId);
    fixture.componentRef.setInput('expenseId', id);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load expense when id emits a value', () => {
    fixture.detectChanges();

    expect(expenseStoreSpy.clean).toHaveBeenCalled();
    expect(expenseStoreSpy.loadById).toHaveBeenCalledWith(roomId, id);
  });

  it('should pass selected expense to the shared form', () => {
    expenseStoreSpy.selected.set(mockExpense);
    fixture.detectChanges();

    const expenseComponent = fixture.debugElement.children[0].componentInstance as ExpenseComponent;

    expect(expenseComponent.expense()).toEqual(jasmine.objectContaining({
      id,
      invoice: 'Test Expense',
      description: 'Test Description',
    }));
  });

  it('should call update when expense is received', () => {
    fixture.detectChanges();

    component.submit({ expense: mockExpense });

    expect(expenseStoreSpy.update).toHaveBeenCalledWith(id, roomId, jasmine.objectContaining({
      invoice: 'Test Expense',
      description: 'Test Description',
    }), undefined);
  });
});
