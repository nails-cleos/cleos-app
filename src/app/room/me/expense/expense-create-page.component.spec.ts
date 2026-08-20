import { beforeEach, describe, expect, it, type Mock, vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpenseCreatePageComponent } from './expense-create-page.component';
import { ExpenseStore } from '@app/store/expense.store';
import { IExpense } from './expense';
import { provideTranslateService } from '@ngx-translate/core';
import { NavigationService } from '@app/services/navigation.service';
import { AuthUserService } from '@app/services/auth-user.service';
import { signal } from '@angular/core';
import { AwsStore } from '@app/store/aws.store';
import { DriveAccessService } from '@app/services/drive-access.service';
import { TokenService } from '@app/services/token.service';
import { provideAppDateAdapter } from '@app/util/adapter/app-date.provider';

describe('ExpenseCreatePageComponent', () => {
  let component: ExpenseCreatePageComponent;
  let fixture: ComponentFixture<ExpenseCreatePageComponent>;

  let expenseStoreSpy: {
    clean: Mock;
    create: Mock;
  };

  const mockExpense: IExpense = {
    invoice: 'Test Expense',
    description: 'Test Description',
  };

  const mockFile = new File(['dummy content'], 'invoice.pdf', {
    type: 'application/pdf',
  });

  beforeEach(async () => {
    expenseStoreSpy = {
      clean: vi.fn().mockName('clean'),
      create: vi.fn().mockName('create'),
    };

    await TestBed.configureTestingModule({
      imports: [ExpenseCreatePageComponent],
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

    fixture = TestBed.createComponent(ExpenseCreatePageComponent);
    fixture.componentRef.setInput('id', 'room-123');
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should call create when expense is received', () => {
    component.submit({ expense: mockExpense, file: mockFile });

    expect(expenseStoreSpy.create).toHaveBeenCalledWith(
      'room-123',
      expect.objectContaining({
        invoice: 'Test Expense',
        description: 'Test Description',
      }),
      mockFile,
    );
  });
});
