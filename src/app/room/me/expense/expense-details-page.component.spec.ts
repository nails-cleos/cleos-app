import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { signal } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpenseDetailsPageComponent } from './expense-details-page.component';
import { ExpenseStore } from '@app/store/expense.store';
import { IExpense } from './expense';
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
    clean: Mock;
    loadInfo: Mock;
    loadById: Mock;
    update: Mock;
  };

  const roomId = '1234';
  const id = '123';

  const mockExpense: IExpense = {
    id,
    invoice: 'Test Expense',
    description: 'Test Description',
    expenseTotals: [],
  };

  beforeEach(async () => {
    expenseStoreSpy = {
      selected: signal<any>(undefined),
      info: signal<any>(undefined),
      subErrors: signal<any>(undefined),
      response: signal<any>(undefined),
      error: signal<any>(undefined),
      isLoading: signal(false),
      clean: vi.fn().mockName('clean'),
      loadInfo: vi.fn().mockName('loadInfo'),
      loadById: vi.fn().mockName('loadById'),
      update: vi.fn().mockName('update'),
    };

    await TestBed.configureTestingModule({
      imports: [ExpenseDetailsPageComponent],
      providers: [
        provideTranslateService(),
        { provide: ExpenseStore, useValue: expenseStoreSpy },
        {
          provide: AwsStore,
          useValue: {
            data: signal(undefined),
            processPdf: vi.fn().mockName('processPdf'),
            clean: vi.fn().mockName('clean'),
          },
        },
        {
          provide: AuthUserService,
          useValue: { authUser: signal({ userId: 'user-1' }) },
        },
        {
          provide: DriveAccessService,
          useValue: {
            requestAccessIfNeeded: vi.fn().mockName('requestAccessIfNeeded'),
          },
        },
        {
          provide: NavigationService,
          useValue: { back: vi.fn().mockName('back') },
        },
        { provide: TokenService, useValue: { token: signal('token') } },
        provideAppDateAdapter(),
      ],
      teardown: {
        destroyAfterEach: true,
      },
    }).compileComponents();

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

    expect(component.expense()).toEqual(
      expect.objectContaining({
        id,
        invoice: 'Test Expense',
        description: 'Test Description',
      }),
    );
  });

  it('should call update when expense is received', () => {
    fixture.detectChanges();

    component.submit({ expense: mockExpense });

    expect(expenseStoreSpy.update).toHaveBeenCalledWith(
      id,
      roomId,
      expect.objectContaining({
        invoice: 'Test Expense',
        description: 'Test Description',
      }),
      undefined,
    );
  });
});
