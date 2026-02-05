import { createYearlyWorkbook } from './report';
import { EnvService } from '../services/env.service';
import { TranslateService } from '@ngx-translate/core';
import { IMonthlyExport, IMonthlySummaryExpense, IMonthlySummarySale, ISummaryTotal } from '../interfaces/dashboard';
import { PaymentType } from '../interfaces/payment';
import { States } from '../interfaces/reservation';
import { monthViewTitle } from './dates';

const buildSummaryTotal = (
  gross: number,
  net: number,
  btw: number,
  overrides?: Partial<ISummaryTotal>,
): ISummaryTotal => ({
  id: 'T1',
  paymentType: PaymentType.cash,
  expenseType: 'DIRECT_COSTS',
  expenseSubType: 'DIRECT_COSTS',
  type: 'INCOME',
  description: '',
  discountDescription: '',
  discountValue: 0,
  payments: [],
  gross,
  net,
  btw,
  size: 1,
  ...overrides,
});

const buildTranslate = (): TranslateService => {
  const translations: Record<string, string> = {
    'SUMMARY.YEAR.RESULT': 'Year Summary',
    'SUMMARY.MONTHLY.TABLE.MONTH': 'Month',
    'SUMMARY.MONTHLY.TABLE.GROSS': 'Gross',
    'SUMMARY.MONTHLY.TABLE.NET': 'Net',
    'SUMMARY.MONTHLY.TABLE.BTW': 'BTW',
    'SUMMARY.INCOMES': 'Incomes',
    'SUMMARY.EXPENSES': 'Expenses',
    'SUMMARY.TOTAL': 'Total',
  };

  return {
    instant: (key: string) => translations[key] ?? key,
  } as TranslateService;
};

describe('report util', () => {
  const env = { appServer: 'http://example.com' } as EnvService;
  const translate = buildTranslate();

  const buildMonthlyExport = (): IMonthlyExport[] => {
    const payment = buildSummaryTotal(100, 80, 20, { type: 'INCOME' });
    const saleTotal = buildSummaryTotal(100, 80, 20, { payments: [payment], type: 'INCOME' });
    const saleSummary = {
      id: 'S1',
      paths: ['sales', 'S1'],
      position: 1,
      timestamp: Date.UTC(2024, 0, 15),
      total: saleTotal,
      day: 15,
      state: States.paid,
      reservationDate: new Date('2024-01-15'),
      customerName: 'Jane Doe',
      description: 'Service',
      color: 'Red',
    } as IMonthlySummarySale;

    const expenseTotal = buildSummaryTotal(40, 32, 8, { type: 'EXPENSE' });
    const expenseSummary = {
      id: 'E1',
      paths: ['expenses', 'E1'],
      position: 1,
      timestamp: Date.UTC(2024, 0, 20),
      total: expenseTotal,
      day: 20,
      expenseDate: new Date('2024-01-20'),
      invoice: 'INV-1',
      supplyStore: 'Store',
    } as IMonthlySummaryExpense;

    return [{
      month: 1,
      saleSummary: [saleSummary],
      expenseSummary: [expenseSummary],
      cashSummary: [],
    }];
  };

  it('should keep monthly and quarter sheets in yearly export', () => {
    const workbook = createYearlyWorkbook(
      buildMonthlyExport(),
      new Date('2024-01-01'),
      '$',
      'UTC',
      translate,
      env,
    );

    expect(workbook.getWorksheet('Q1')).toBeTruthy();
    expect(workbook.getWorksheet('Q2')).toBeTruthy();
    expect(workbook.getWorksheet('Q3')).toBeTruthy();
    expect(workbook.getWorksheet('Q4')).toBeTruthy();

    const january = monthViewTitle(new Date(2024, 0, 1));
    expect(workbook.getWorksheet(january)).toBeTruthy();
  });

  it('should add a year summary sheet with totals', () => {
    const workbook = createYearlyWorkbook(
      buildMonthlyExport(),
      new Date('2024-01-01'),
      '$',
      'UTC',
      translate,
      env,
    );

    const worksheet = workbook.getWorksheet('Year Summary');
    expect(worksheet).toBeTruthy();
    if (!worksheet) {
      return;
    }

    const january = monthViewTitle(new Date(2024, 0, 1));
    expect(worksheet.getCell('A3').value).toBe(january);

    const totalRow = 15;
    expect(worksheet.getCell(`A${totalRow}`).value).toBe('Total');

    expect((worksheet.getCell(`B${totalRow}`).value as any).result).toBe(100);
    expect((worksheet.getCell(`C${totalRow}`).value as any).result).toBe(80);
    expect((worksheet.getCell(`D${totalRow}`).value as any).result).toBe(20);
    expect((worksheet.getCell(`E${totalRow}`).value as any).result).toBe(40);
    expect((worksheet.getCell(`F${totalRow}`).value as any).result).toBe(32);
    expect((worksheet.getCell(`G${totalRow}`).value as any).result).toBe(8);
    expect((worksheet.getCell(`H${totalRow}`).value as any).result).toBe(60);
    expect((worksheet.getCell(`I${totalRow}`).value as any).result).toBe(48);
    expect((worksheet.getCell(`J${totalRow}`).value as any).result).toBe(12);
  });

  it('should set active tab to the selected month', () => {
    const workbook = createYearlyWorkbook(
      buildMonthlyExport(),
      new Date('2024-02-01'),
      '$',
      'UTC',
      translate,
      env,
    );

    const february = monthViewTitle(new Date(2024, 1, 1));
    const expectedIndex = workbook.worksheets.findIndex(sheet => sheet.name === february);

    expect(workbook.views?.[0]?.activeTab).toBe(expectedIndex);
  });
});
