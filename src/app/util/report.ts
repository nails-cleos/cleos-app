import { CellFormulaValue, CellHyperlinkValue, Workbook, Worksheet } from 'exceljs';
import { API_LOCALE, createNewDateZonedTime, exportFormatDate, getCurrentTimeZone, monthViewTitle, newDateTimestamp } from './dates';
import {
  IMonthlyExport,
  IMonthlySummaryExpense,
  IMonthlySummarySale,
  IMonthSummary,
  ISummaryTotal,
  ISummaryTotals,
  SummaryType
} from '../interfaces/dashboard';
import { TranslateService } from '@ngx-translate/core';
import { titleCase } from './helper';

interface IMonthResult {
  name: string;
  month: number;
  totalGross: number;
  totalNet: number;
  totalBtw: number;
  cellNumber: number;
}

export const createMonthlyExpenseWorkbook = (data: IMonthlySummaryExpense[], weeks: any[], title: string, name: string,
                                             translate: TranslateService, currency: string,
                                             timeZone: string = getCurrentTimeZone()): Workbook => {
  const workbook = new Workbook();
  monthlyExpenseWorksheet(workbook, data, weeks, title, name, translate, currency, timeZone);
  return workbook;
};

export const createMonthlyIncomeWorkbook = (data: IMonthlySummarySale[], weeks: any[], title: string, type: string,
                                            name: string, translate: TranslateService, currency: string,
                                            timeZone: string = getCurrentTimeZone()): Workbook => {
  const workbook = new Workbook();

  monthlyIncomeWorksheet(workbook, data, weeks, title, type, name, translate, currency, timeZone);
  return workbook;
};

export const createMonthlySummary = (weeks: any[], currency: string, translate: TranslateService,
                                     timeZone: string = getCurrentTimeZone(), income?: IMonthlySummarySale[],
                                     expense?: IMonthlySummaryExpense[]): Workbook => {
  const workbook = new Workbook();
  if (income?.length) {
    monthlyIncomeWorksheet(workbook, income, weeks, translate.instant('SUMMARY.INCOMES'),
      SummaryType[SummaryType.payment], titleCase(SummaryType[SummaryType.payment]), translate, currency, timeZone);
  }
  if (expense?.length) {
    monthlyExpenseWorksheet(workbook, expense, weeks, translate.instant('SUMMARY.EXPENSES'),
      titleCase(SummaryType[SummaryType.expense]), translate, currency, timeZone);
  }

  return workbook;
};

export const createQuarterSummary = (quarter: number, year: number, monthSummaries: IMonthSummary[],
                                     quarterSummaryTotals: ISummaryTotals, currency: string): Workbook => {
  const workbook = new Workbook();
  const name = `Q${ quarter }`;
  const worksheet = workbook.addWorksheet(name);

  setTitle(worksheet, 1, 'D', 'Income');
  worksheet.addRow(['Month', 'Gross', 'Net', 'BTW']);
  setSubtitle(worksheet, qCells, 2);
  setTitle(worksheet, 8, 'D', 'Expense');
  worksheet.addRow(['Month', 'Gross', 'Net', 'BTW']);
  setSubtitle(worksheet, qCells, 9);
  setTitle(worksheet, 15, 'D', 'Totals');

  monthSummaries.forEach((it, index) => {
    const totalIncome = it.total.find(total => total.type === 'INCOME');
    const totalExpense = it.total.find(total => total.type === 'EXPENSE');
    const month = monthViewTitle(new Date(year, it.month - 1));
    worksheet.getRow(3 + index).values = [month,
      totalIncome?.gross || 0, totalIncome?.net || 0, totalIncome?.btw || 0];
    worksheet.getRow(10 + index).values = [month,
      totalExpense?.gross || 0, totalExpense?.net || 0, totalExpense?.btw || 0];
  });

  setBorder(worksheet, 3, 5, qCells);
  setBorder(worksheet, 10, 12, qCells);

  setTotalTitle(worksheet, 6);
  setTotal(worksheet, 6, 'B', 'SUM(B3:B5)', quarterSummaryTotals.income.gross, 'D');
  setTotal(worksheet, 6, 'C', 'SUM(C3:C5)', quarterSummaryTotals.income.net, 'D');
  setTotal(worksheet, 6, 'D', 'SUM(D3:D5)', quarterSummaryTotals.income.btw, 'D');

  setTotalTitle(worksheet, 13);
  setTotal(worksheet, 13, 'B', 'SUM(B10:B12)', quarterSummaryTotals.expense.gross * -1, 'D');
  setTotal(worksheet, 13, 'C', 'SUM(C10:C12)', quarterSummaryTotals.expense.net * -1, 'D');
  setTotal(worksheet, 13, 'D', 'SUM(D10:D12)', quarterSummaryTotals.expense.btw * -1, 'D');

  setTotalTitle(worksheet, 16);
  setTotal(worksheet, 16, 'B', 'B6 - B13', quarterSummaryTotals.totalsWithoutCash.gross, 'D');
  setTotal(worksheet, 16, 'C', 'C6 - C13', quarterSummaryTotals.totalsWithoutCash.net, 'D');
  setTotal(worksheet, 16, 'D', 'D6 - D13', quarterSummaryTotals.totalsWithoutCash.btw, 'D');

  const priceFormat = currencyFormat(currency);
  worksheet.getColumn('B').numFmt = priceFormat;
  worksheet.getColumn('C').numFmt = priceFormat;
  worksheet.getColumn('D').numFmt = priceFormat;

  const positivePriceFormat = currencyFormat(currency, true);
  worksheet.getCell('B16').numFmt = positivePriceFormat;
  worksheet.getCell('C16').numFmt = positivePriceFormat;
  worksheet.getCell('D16').numFmt = positivePriceFormat;

  resizeColumn(worksheet);

  return workbook;
};

export const createYearlyWorkbook = (data: IMonthlyExport[], date: Date, currency: string,
                                     timeZone: string = getCurrentTimeZone()): Workbook => {
  const workbook = new Workbook();
  let monthResults: IMonthResult[] = [];
  completeData(workbook, date, data).forEach(it => {
    const name = monthViewTitle(new Date(date.getFullYear(), it.month - 1));
    const worksheet = workbook.getWorksheet(name);

    const { saleRowData, saleGross, saleNet, saleBtw } = getSaleRowData(it.saleSummary, timeZone);
    let cellNumber = addData(worksheet, 'Sales', 1, 'Customer', 'Description', saleRowData, saleGross, saleNet, saleBtw);

    const saleCellNumber = cellNumber;

    // Add 2 extra cells
    cellNumber++;
    cellNumber++;
    cellNumber++;

    const { expenseRowData, expenseGross, expenseNet, expenseBtw } = getExpenseRowData(it.expenseSummary, timeZone);
    cellNumber = addData(worksheet, 'Expenses', cellNumber, 'Invoice', 'Supply store',
      expenseRowData, expenseGross, expenseNet, expenseBtw);

    const expenseCellNumber = cellNumber;

    // Add 2 extra cells
    cellNumber++;
    cellNumber++;
    cellNumber++;

    worksheet.mergeCells(`A${ cellNumber }`, `D${ cellNumber }`);
    setTotalTitle(worksheet, cellNumber);

    const totalGross = saleGross - expenseGross;
    const totalNet = saleNet - expenseNet;
    const totalBtw = saleBtw - expenseBtw;

    setTotal(worksheet, cellNumber, 'E', `E${ saleCellNumber } - E${ expenseCellNumber }`, totalGross);
    setTotal(worksheet, cellNumber, 'F', `F${ saleCellNumber } - F${ expenseCellNumber }`, totalNet);
    setTotal(worksheet, cellNumber, 'G', `G${ saleCellNumber } - G${ expenseCellNumber }`, totalBtw);

    const priceFormat = currencyFormat(currency);
    worksheet.getColumn('E').numFmt = priceFormat;
    worksheet.getColumn('F').numFmt = priceFormat;
    worksheet.getColumn('G').numFmt = priceFormat;

    const positivePriceFormat = currencyFormat(currency, true);
    worksheet.getCell(`E${ cellNumber }`).numFmt = positivePriceFormat;
    worksheet.getCell(`F${ cellNumber }`).numFmt = positivePriceFormat;
    worksheet.getCell(`G${ cellNumber }`).numFmt = positivePriceFormat;

    monthResults = [...monthResults, { month: it.month, name, totalGross, totalNet, totalBtw, cellNumber }];

    resizeColumn(worksheet);
  });

  createQData(workbook, monthResults, currency);

  return workbook;
};

const qCells = ['A', 'B', 'C', 'D'];
const monthCells = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
const incomeCells = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
const expenseCells = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

const monthlyExpenseWorksheet = (workbook: Workbook, data: IMonthlySummaryExpense[], weeks: any[], title: string,
                                 name: string, translate: TranslateService, currency: string,
                                 timeZone: string): Worksheet => {
  const worksheet = workbook.addWorksheet(name);
  let cellNumber = 1;
  setTitle(worksheet, cellNumber, 'H', title);
  cellNumber++;

  worksheet.addRow([
    'N°',
    translate.instant('SUMMARY.MONTHLY.TABLE.DATE'),
    translate.instant('SUMMARY.MONTHLY.TABLE.INVOICE'),
    translate.instant('SUMMARY.MONTHLY.TABLE.SUPPLY_STORE'),
    translate.instant('SUMMARY.MONTHLY.TABLE.TYPE'),
    translate.instant('SUMMARY.MONTHLY.TABLE.GROSS'),
    translate.instant('SUMMARY.MONTHLY.TABLE.NET'),
    translate.instant('SUMMARY.MONTHLY.TABLE.BTW')
  ]);
  setSubtitle(worksheet, expenseCells, cellNumber);

  cellNumber++;
  let totalGross = 0;
  let totalNet = 0;
  let totalBtw = 0;
  weeks.forEach((week, index) => {
    setWeek(worksheet, cellNumber, index, 'H', translate);

    let rowIndex = 0;
    const rowData = data.filter(item => week.dates.includes(item.day));

    if (rowData.length) {
      rowData.forEach((expense) => {
        // const id = {
        //   text: income.id,
        //   hyperlink: `${ environment.appServer }/${ income.paths.join('/') }`
        // } as CellHyperlinkValue;

        totalGross += expense.total.gross;
        totalNet += expense.total.net;
        totalBtw += expense.total.btw;
        const typeValue = translate.instant(getTranslateTypeKey(SummaryType[SummaryType.expense], expense.total.expenseType));
        worksheet.addRow([++rowIndex, exportFormatDate(newDateTimestamp(expense.timestamp, timeZone), API_LOCALE, timeZone),
          expense.invoice, expense.supplyStore, typeValue, expense.total.gross, expense.total.net, expense.total.btw]);
      });
      const init = ++cellNumber;
      cellNumber += rowIndex;
      setBorder(worksheet, init, cellNumber - 1, expenseCells);
    } else {
      cellNumber++;
    }
  });

  worksheet.mergeCells(`A${ cellNumber }`, `E${ cellNumber }`);
  setTotalTitle(worksheet, cellNumber);

  setTotal(worksheet, cellNumber, 'F', `SUM(F${ 3 }:F${ cellNumber - 1 })`, totalNet, 'H');
  setTotal(worksheet, cellNumber, 'G', `SUM(G${ 3 }:G${ cellNumber - 1 })`, totalBtw, 'H');
  setTotal(worksheet, cellNumber, 'H', `SUM(H${ 3 }:H${ cellNumber - 1 })`, totalGross, 'H');

  const priceFormat = currencyFormat(currency);
  worksheet.getColumn('F').numFmt = priceFormat;
  worksheet.getColumn('G').numFmt = priceFormat;
  worksheet.getColumn('H').numFmt = priceFormat;

  resizeColumn(worksheet);

  return worksheet;
};

const monthlyIncomeWorksheet = (workbook: Workbook, data: IMonthlySummarySale[], weeks: any[], title: string,
                                type: string, name: string, translate: TranslateService, currency: string,
                                timeZone: string): Worksheet => {
  const worksheet = workbook.addWorksheet(name);
  let cellNumber = 1;
  setTitle(worksheet, cellNumber, 'J', title);
  cellNumber++;

  worksheet.addRow([
    'N°',
    translate.instant('SUMMARY.MONTHLY.TABLE.DATE'),
    translate.instant('SUMMARY.MONTHLY.TABLE.CUSTOMER'),
    translate.instant('SUMMARY.MONTHLY.TABLE.DESCRIPTION'),
    translate.instant('SUMMARY.MONTHLY.TABLE.DISCOUNT'),
    translate.instant('SUMMARY.MONTHLY.TABLE.COLOR'),
    translate.instant('SUMMARY.MONTHLY.TABLE.TYPE'),
    translate.instant('SUMMARY.MONTHLY.TABLE.GROSS'),
    translate.instant('SUMMARY.MONTHLY.TABLE.NET'),
    translate.instant('SUMMARY.MONTHLY.TABLE.BTW')
  ]);
  setSubtitle(worksheet, incomeCells, cellNumber);

  cellNumber++;
  let totalGross = 0;
  let totalNet = 0;
  let totalBtw = 0;
  let totalRow = 0;
  weeks.forEach((week, index) => {
    setWeek(worksheet, cellNumber, index, 'J', translate);

    let rowIndex = 0;
    const rowData = data.filter(item => week.dates.includes(item.day));

    if (rowData.length) {
      rowData.forEach((income) => {
        // const id = {
        //   text: income.id,
        //   hyperlink: `${ environment.appServer }/${ income.paths.join('/') }`
        // } as CellHyperlinkValue;

        if (income.total.payments.length) {
          const paymentInit = rowIndex;
          const paymentSize = income.total.payments.length;
          income.total.payments.forEach((payment: ISummaryTotal) => {
            rowIndex++;
            const typeValue = translate.instant(getTranslateTypeKey(type, payment.paymentType));
            totalGross += payment.gross;
            totalNet += payment.net;
            totalBtw += payment.btw;
            worksheet.addRow([++totalRow, exportFormatDate(newDateTimestamp(income.timestamp, timeZone), API_LOCALE, timeZone),
              income.customerName, income.description, income.total.discountDescription, income.color, typeValue,
              payment.gross, payment.net, payment.btw]);
          });
          if (paymentSize > 1) {
            const start = paymentInit + cellNumber;
            worksheet.mergeCells(`A${ start + 1 }`, `A${ start + paymentSize }`);
            worksheet.mergeCells(`C${ start + 1 }`, `C${ start + paymentSize }`);
            worksheet.mergeCells(`D${ start + 1 }`, `D${ start + paymentSize }`);
            worksheet.mergeCells(`E${ start + 1 }`, `E${ start + paymentSize }`);
            worksheet.mergeCells(`F${ start + 1 }`, `F${ start + paymentSize }`);
          }
        } else {
          totalGross += income.total.gross;
          totalNet += income.total.net;
          totalBtw += income.total.btw;
          rowIndex++;
          const typeValue = translate.instant(getTranslateTypeKey(type));
          worksheet.addRow([++totalRow, exportFormatDate(newDateTimestamp(income.timestamp, timeZone), API_LOCALE, timeZone),
            income.customerName, income.description, income.total.discountDescription, income.color, typeValue,
            income.total.gross, income.total.net, income.total.btw]);
        }
      });
      const init = ++cellNumber;
      cellNumber += rowIndex;
      setBorder(worksheet, init, cellNumber - 1, incomeCells);
    } else {
      cellNumber++;
    }
  });

  worksheet.mergeCells(`A${ cellNumber }`, `G${ cellNumber }`);
  setTotalTitle(worksheet, cellNumber);

  setTotal(worksheet, cellNumber, 'H', `SUM(H${ 3 }:H${ cellNumber - 1 })`, totalNet, 'J');
  setTotal(worksheet, cellNumber, 'I', `SUM(I${ 3 }:I${ cellNumber - 1 })`, totalBtw, 'J');
  setTotal(worksheet, cellNumber, 'J', `SUM(J${ 3 }:J${ cellNumber - 1 })`, totalGross, 'J');

  const priceFormat = currencyFormat(currency);
  worksheet.getColumn('H').numFmt = priceFormat;
  worksheet.getColumn('I').numFmt = priceFormat;
  worksheet.getColumn('J').numFmt = priceFormat;

  resizeColumn(worksheet);

  return worksheet;
};
const completeData = (workbook: Workbook, date: Date, data: IMonthlyExport[]): IMonthlyExport[] => {
  for (let i = 12; i >= 1; i--) {
    if (i % 3 === 0) {
      workbook.addWorksheet(`Q${ (i / 3) }`);
    }
    const name = monthViewTitle(new Date(date.getFullYear(), i - 1));
    workbook.addWorksheet(name);
    if (!data.find(it => it.month === i)) {
      data = [...data, { month: i, expenseSummary: [], saleSummary: [], cashSaleSummary: [] }];
    }
  }
  return data.sort((a, b) => a.month - b.month);
};
const addData = (worksheet: Worksheet, key: string, cellNumber: number, column3Name: string, column4Name: string,
                 rowData: (CellHyperlinkValue | string | number)[][], gross: number, net: number, btw: number): number => {
  setTitle(worksheet, cellNumber, 'G', key);

  // Add Header Rows
  worksheet.addRow(['N°', 'Date', column3Name, column4Name, 'Gross', 'Net', 'BTW']);
  cellNumber++;
  setSubtitle(worksheet, monthCells, cellNumber);

  const init = ++cellNumber;
  if (rowData.length) {
    worksheet.addRows(rowData);
    cellNumber += rowData.length;
    setBorder(worksheet, init, cellNumber - 1, monthCells);

    worksheet.mergeCells(`A${ cellNumber }`, `D${ cellNumber }`);
    const totalCell = worksheet.getCell(`A${ cellNumber }`);
    totalCell.value = 'Total';
    totalCell.alignment = { vertical: 'middle', horizontal: 'right' };
    totalCell.border = {
      bottom: { style: 'medium' },
      left: { style: 'medium' },
      right: { style: 'medium' },
      top: { style: 'medium' }
    };
    totalCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'dcc8c2' }
    };

    setTotal(worksheet, cellNumber, 'E', `SUM(E${ init }:E${ cellNumber - 1 })`, gross);
    setTotal(worksheet, cellNumber, 'F', `SUM(F${ init }:F${ cellNumber - 1 })`, net);
    setTotal(worksheet, cellNumber, 'G', `SUM(G${ init }:G${ cellNumber - 1 })`, btw);
  } else {
    // no data
    worksheet.mergeCells(`A${ cellNumber }`, `G${ cellNumber }`);
    const noDataCell = worksheet.getCell(`A${ cellNumber }`);
    noDataCell.value = 'No data';
    noDataCell.alignment = { vertical: 'middle', horizontal: 'center' };
    noDataCell.border = {
      bottom: { style: 'medium' },
      left: { style: 'medium' },
      right: { style: 'medium' }
    };
    noDataCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'f08080' }
    };
  }

  return cellNumber;
};

const setTitle = (worksheet: Worksheet, cellNumber: number, endLetter: string, key: string, startLetter: string = 'A') => {
  worksheet.mergeCells(`${ startLetter }${ cellNumber }`, `${ endLetter }${ cellNumber }`);
  const titleCell = worksheet.getCell(`${ startLetter }${ cellNumber }`);
  titleCell.value = key;
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  titleCell.border = {
    top: { style: 'medium' },
    left: { style: 'medium' },
    right: { style: 'medium' }
  };
  titleCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'a9a397' }
  };
};

const setSubtitle = (worksheet: Worksheet, cellList: string[], cellNumber: number) => {
  cellList.forEach((cell, index) => {
    const currentCell = worksheet.getCell(`${ cell }${ cellNumber }`);
    currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
    currentCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'dcc8c2' }
    };
    currentCell.border = {
      left: { style: index === 0 ? 'medium' : 'thin' },
      right: { style: index === cellList.length - 1 ? 'medium' : 'thin' },
      top: { style: 'thin' },
      bottom: { style: 'thin' }
    };
  });
};

const getTranslateTypeKey = (key: string, type: string = 'PENDING') => `COMMON.${ key.toUpperCase() }.TYPE.${ type }`;
const getSaleRowData = (saleSummary: IMonthlySummarySale[], timeZone: string): {
  saleRowData: (string | number)[][];
  saleGross: number;
  saleBtw: number;
  saleNet: number;
} => {
  let gross = 0;
  let net = 0;
  let btw = 0;
  const rowData = saleSummary.map((sale, index) => {
    // const id = {
    //   text: sale.id,
    //   hyperlink: `${ environment.appServer }/${ sale.paths.join('/') }`
    // } as CellHyperlinkValue;

    const paid = sale.total.payments.reduce((payments: any, payment: ISummaryTotal) => {
      payments.gross += payment.gross;
      payments.net += payment.net;
      payments.btw += payment.btw;
      return payments;
    }, { gross: 0, net: 0, btw: 0 });

    gross += paid.gross;
    net += paid.net;
    btw += paid.btw;

    return [index + 1, exportFormatDate(newDateTimestamp(sale.timestamp, timeZone), API_LOCALE, timeZone),
      sale.customerName, sale.description, paid.gross, paid.net, paid.btw];
  });

  return { saleRowData: rowData, saleGross: gross, saleNet: net, saleBtw: btw };
};

const getExpenseRowData = (expenseSummary: IMonthlySummaryExpense[], timeZone: string): {
  expenseGross: number;
  expenseBtw: number;
  expenseRowData: (string | number)[][];
  expenseNet: number;
} => {
  let gross = 0;
  let net = 0;
  let btw = 0;
  const rowData = expenseSummary.map((expense, index) => {
    // const id = {
    //   text: expense.id,
    //   hyperlink: `${ environment.appServer }/${ expense.paths.join('/') }`
    // } as CellHyperlinkValue;

    gross += expense.total.gross;
    net += expense.total.net;
    btw += expense.total.btw;

    return [index + 1, exportFormatDate(createNewDateZonedTime(expense.timestamp, timeZone), API_LOCALE, timeZone),
      expense.invoice, expense.supplyStore, expense.total.gross, expense.total.net, expense.total.btw];
  });

  return { expenseRowData: rowData, expenseGross: gross, expenseNet: net, expenseBtw: btw };
};

const createQData = (workbook: Workbook, monthResults: IMonthResult[], currency: string) => {
  [...Array(4)].map((_, i) => {
    const name = `Q${ ++i }`;
    const worksheet = workbook.getWorksheet(name);
    setTitle(worksheet, 1, 'D', name);
    worksheet.addRow(['', 'Gross', 'Net', 'BTW']);
    setSubtitle(worksheet, qCells, 2);

    let totalGross = 0;
    let totalNet = 0;
    let totalBtw = 0;
    monthResults.filter(it => it.month <= i * 3 && it.month > (i - 1) * 3).forEach((it, index) => {
      worksheet.addRow([it.name]);
      setQTotal(worksheet, it, 'B', 3 + index, 'E');
      setQTotal(worksheet, it, 'C', 3 + index, 'F');
      setQTotal(worksheet, it, 'D', 3 + index, 'G');
      totalGross += it.totalGross;
      totalNet += it.totalNet;
      totalBtw += it.totalBtw;
    });

    setBorder(worksheet, 3, 5, qCells);

    setTotalTitle(worksheet, 6);
    setTotal(worksheet, 6, 'B', 'SUM(B3:B5)', totalGross);
    setTotal(worksheet, 6, 'C', 'SUM(C3:C5)', totalNet);
    setTotal(worksheet, 6, 'D', 'SUM(D3:D5)', totalBtw);

    const positivePriceFormat = currencyFormat(currency, true);
    worksheet.getColumn('B').numFmt = positivePriceFormat;
    worksheet.getColumn('C').numFmt = positivePriceFormat;
    worksheet.getColumn('D').numFmt = positivePriceFormat;

    resizeColumn(worksheet);
  });
};

const setTotalTitle = (worksheet: Worksheet, cellNumber: number) => {
  const resultCellTitle = worksheet.getCell(`A${ cellNumber }`);
  resultCellTitle.value = 'Result';
  resultCellTitle.alignment = { vertical: 'middle', horizontal: 'right' };
  resultCellTitle.border = {
    bottom: { style: 'medium' },
    left: { style: 'medium' },
    right: { style: 'medium' },
    top: { style: 'medium' }
  };
  resultCellTitle.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'dcc8c2' }
  };
};
const setTotal = (worksheet: Worksheet, cellNumber: number, letter: string, formula: string, result: number,
                  endBorder: string = 'G'): void => {
  const totalCell = worksheet.getCell(`${ letter }${ cellNumber }`);
  totalCell.value = {
    formula,
    result
  } as CellFormulaValue;
  totalCell.font = {
    bold: true
  };
  totalCell.border = {
    top: { style: 'double' },
    bottom: { style: 'medium' },
    right: { style: letter === endBorder ? 'medium' : 'thin' }
  };
  totalCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'dcc8c2' }
  };
};

const setQTotal = (worksheet: Worksheet, monthResult: IMonthResult, cellLetter: string, cellNumber: number, formulaLetter: string) => {
  worksheet.getCell(`${ cellLetter }${ cellNumber }`).value = {
    formula: `'${ monthResult.name }'!${ formulaLetter }${ monthResult.cellNumber }`,
    result: monthResult.totalGross
  } as CellFormulaValue;
};

const setWeek = (worksheet: Worksheet, cellNumber: number, index: number, endLetter: string, translate: TranslateService) => {
  worksheet.mergeCells(`A${ cellNumber }`, `${ endLetter }${ cellNumber }`);
  const weekCell = worksheet.getCell(`A${ cellNumber }`);
  weekCell.value = translate.instant('SUMMARY.MONTHLY.TABLE.WEEK', { weekNumber: index + 1 });
  weekCell.alignment = { vertical: 'middle', horizontal: 'center' };
  weekCell.border = {
    bottom: { style: 'medium' },
    left: { style: 'medium' },
    right: { style: 'medium' },
    top: { style: 'medium' }
  };
  weekCell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'ffd078' }
  };
};

const setBorder = (worksheet: Worksheet, start: number, end: number, cellList: string[]) => {
  cellList.forEach((cell, index) => {
    const length = Math.abs(end - start) + 1;
    Array.from({ length }, (_, i) => start + i).forEach(cellNumber => {
      const currentCell = worksheet.getCell(`${ cell }${ cellNumber }`);
      currentCell.border = {
        left: { style: index === 0 ? 'medium' : 'thin' },
        right: { style: index === cellList.length - 1 ? 'medium' : 'thin' },
      };
      currentCell.alignment = { vertical: 'middle' };
    });
  });
};

const resizeColumn = (worksheet: Worksheet) => {
  worksheet.columns.forEach(column => {
    if (column.values) {
      const lengths = column.values.map(v => v?.toString()?.length || 0);
      column.width = Math.max(...lengths.filter(v => typeof v === 'number'));
    }
  });
};

const currencyFormat = (currency: string, positiveColor: boolean = false) =>
  `${ positiveColor ? '[Green]' : '' }"${ currency }"#,##0.00;[Red]\-"${ currency }"#,##0.00`;
