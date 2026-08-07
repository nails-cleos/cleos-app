import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ExpenseCreatePageComponent } from './expense-create-page.component';
import { ExpenseStore } from '@app/store/expense.store';
import { IExpense } from './expense';

describe('ExpenseCreatePageComponent', () => {
  let component: ExpenseCreatePageComponent;
  let fixture: ComponentFixture<ExpenseCreatePageComponent>;

  let expenseStoreSpy: {
    clean: jasmine.Spy;
    create: jasmine.Spy;
  };

  const mockExpense: IExpense = {
    invoice: 'Test Expense',
    description: 'Test Description',
  };

  const mockFile = new File(
    ['dummy content'],
    'invoice.pdf',
    { type: 'application/pdf' },
  );

  beforeEach(async () => {
    expenseStoreSpy = {
      clean: jasmine.createSpy('clean'),
      create: jasmine.createSpy('create'),
    };

    await TestBed.configureTestingModule({
      imports: [ExpenseCreatePageComponent],
      providers: [
        { provide: ExpenseStore, useValue: expenseStoreSpy },
      ],
    }).overrideTemplate(ExpenseCreatePageComponent, '')
      .compileComponents();

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
      jasmine.objectContaining({
        invoice: 'Test Expense',
        description: 'Test Description',
      }),
      mockFile,
    );
  });
});
