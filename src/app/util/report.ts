import {
  Cell,
  CellFormulaValue,
  CellHyperlinkValue,
  Row,
  Workbook,
  Worksheet,
  WorksheetView,
} from 'exceljs';
import {
  createNewDateZonedTime,
  DEFAULT_LOCALE,
  exportFormatDate,
  getCurrentTimeZone,
  monthViewTitle,
  newDateTimestamp,
} from './dates';
import {
  IMonthlyExport,
  IMonthlySummaryExpense,
  IMonthlySummarySale,
  IMonthSummary,
  ISummaryTotal,
  ISummaryTotals,
  SummaryType,
} from '../dashboard/dashboard';
import { TranslateService } from '@ngx-translate/core';
import { currencySymbol, titleCase } from './helper';
import { EnvService } from '../services/env.service';
import { ICurrencyAll } from '@app/currency/currency';
import { ITreatmentAll } from '@app/treatment/treatment';
import { IAdditionalAll } from '@app/additional/additional';
import { PriceListTranslations } from '@app/room/room';

interface ITotal {
  saleGross: number;
  saleNet: number;
  saleBtw: number;
  expenseGross: number;
  expenseNet: number;
  expenseBtw: number;
}

interface IMonthResult {
  name: string;
  month: number;
  total: ITotal;
  cellNumber: number;
}

interface IMoneyTotal {
  gross: number;
  net: number;
  btw: number;
}

interface IPriceRow {
  order: number | undefined;
  name: string;
  price: number;
}

interface IMonthlyWorksheetConfig {
  headers: string[];
  type: SummaryType | string;
  buildRows: (
    item: IMonthlySummarySale | IMonthlySummaryExpense,
    translate: TranslateService,
    timeZone: string,
    env: EnvService,
  ) => IMonthlyRowResult;
  getPayments: (
    item: IMonthlySummarySale | IMonthlySummaryExpense,
  ) => ISummaryTotal[];
}

interface IMonthlyRowResult {
  rows: (CellHyperlinkValue | string | number)[][];
  rowCount: number;
  total: IMoneyTotal;
  mergeColumns: string[];
}

const qCells = ['A', 'B', 'C', 'D'];
const monthCells = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
const cells = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K'];
const yearCells = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

export const createMonthlyExpenseWorkbook = (
  header: string,
  data: IMonthlySummaryExpense[],
  weeks: any[],
  title: string,
  name: string,
  translate: TranslateService,
  currency: string,
  env: EnvService,
  timeZone: string = getCurrentTimeZone(),
): Workbook => {
  const workbook = new Workbook();

  monthlyExpenseWorksheet(
    workbook,
    header,
    data,
    weeks,
    title,
    name,
    translate,
    currency,
    timeZone,
    env,
  );

  return workbook;
};

export const createMonthlyIncomeWorkbook = (
  header: string,
  data: IMonthlySummarySale[],
  weeks: any[],
  title: string,
  type: string,
  name: string,
  translate: TranslateService,
  currency: string,
  env: EnvService,
  timeZone: string = getCurrentTimeZone(),
): Workbook => {
  const workbook = new Workbook();

  monthlyIncomeWorksheet(
    workbook,
    header,
    data,
    weeks,
    title,
    type,
    name,
    translate,
    currency,
    timeZone,
    env,
  );

  return workbook;
};

export const createMonthlySummary = (
  header: string,
  weeks: any[],
  currency: string,
  translate: TranslateService,
  env: EnvService,
  timeZone: string = getCurrentTimeZone(),
  income?: IMonthlySummarySale[],
  expense?: IMonthlySummaryExpense[],
): Workbook => {
  const workbook = new Workbook();

  if (income?.length) {
    monthlyIncomeWorksheet(
      workbook,
      header,
      income,
      weeks,
      translate.instant('SUMMARY.INCOMES'),
      SummaryType.payment,
      titleCase(SummaryType.payment),
      translate,
      currency,
      timeZone,
      env,
    );
  }

  if (expense?.length) {
    monthlyExpenseWorksheet(
      workbook,
      header,
      expense,
      weeks,
      translate.instant('SUMMARY.EXPENSES'),
      titleCase(SummaryType.expense),
      translate,
      currency,
      timeZone,
      env,
    );
  }

  return workbook;
};

export const createQuarterSummary = (
  quarter: number,
  year: number,
  monthSummaries: IMonthSummary[],
  quarterSummaryTotals: ISummaryTotals,
  currency: string,
  translate: TranslateService,
): Workbook => {
  const workbook = new Workbook();
  const name = `Q${quarter}`;
  const worksheet = workbook.addWorksheet(name);

  setQTitles(worksheet, name, translate);

  monthSummaries.forEach((item, index) => {
    const month = monthViewTitle(new Date(year, item.month - 1));
    const incomes = getTotalOrZero(item.total, 'INCOME');
    const expense = getTotalOrZero(item.total, 'EXPENSE');

    worksheet.getRow(3 + index).values = [
      month,
      incomes.gross,
      incomes.net,
      incomes.btw,
    ];

    worksheet.getRow(10 + index).values = [
      month,
      expense.gross,
      expense.net,
      expense.btw,
    ];

    worksheet.getRow(17 + index).values = [
      month,
      incomes.gross - expense.gross,
      incomes.net - expense.net,
      incomes.btw - expense.btw,
    ];
  });

  const qTotal: ITotal = {
    saleGross: quarterSummaryTotals.income.gross,
    saleNet: quarterSummaryTotals.income.net,
    saleBtw: quarterSummaryTotals.income.btw,
    expenseGross: quarterSummaryTotals.expense.gross,
    expenseNet: quarterSummaryTotals.expense.net,
    expenseBtw: quarterSummaryTotals.expense.btw,
  };

  setQ(worksheet, qTotal, currency);
  resizeColumn(worksheet);

  return workbook;
};

export const createYearlyWorkbook = (
  data: IMonthlyExport[],
  date: Date,
  currency: string,
  timeZone: string = getCurrentTimeZone(),
  translate: TranslateService,
  env: EnvService,
): Workbook => {
  const workbook = new Workbook();

  const yearSummarySheetName = translate.instant('SUMMARY.YEAR.RESULT');
  workbook.addWorksheet(yearSummarySheetName);

  const monthResults: IMonthResult[] = [];

  completeData(workbook, date, data).forEach((item) => {
    const name = monthViewTitle(new Date(date.getFullYear(), item.month - 1));

    const worksheet = workbook.getWorksheet(name);

    if (!worksheet) {
      return;
    }

    const { saleRowData, saleGross, saleNet, saleBtw } = getSaleRowData(
      item.saleSummary,
      timeZone,
      env,
    );

    let cellNumber = addData(
      worksheet,
      'SUMMARY.INCOMES',
      1,
      'SUMMARY.MONTHLY.TABLE.CUSTOMER',
      'SUMMARY.MONTHLY.TABLE.DESCRIPTION',
      saleRowData,
      saleGross,
      saleNet,
      saleBtw,
      translate,
    );

    const saleCellNumber = cellNumber;

    cellNumber += 2;

    const { expenseRowData, expenseGross, expenseNet, expenseBtw } =
      getExpenseRowData(item.expenseSummary, timeZone, env);

    cellNumber = addData(
      worksheet,
      'SUMMARY.EXPENSES',
      cellNumber,
      'SUMMARY.MONTHLY.TABLE.INVOICE',
      'SUMMARY.MONTHLY.TABLE.SUPPLY_STORE',
      expenseRowData,
      expenseGross,
      expenseNet,
      expenseBtw,
      translate,
    );

    const idColumn = worksheet.getColumn('B');
    idColumn.alignment = {
      vertical: 'middle',
      horizontal: 'center',
    };

    const expenseCellNumber = cellNumber;

    cellNumber += 3;

    const totalGross = saleGross - expenseGross;
    const totalNet = saleNet - expenseNet;
    const totalBtw = saleBtw - expenseBtw;

    worksheet.mergeCells(`A${cellNumber}`, `E${cellNumber}`);

    setTotal(
      worksheet,
      cellNumber,
      'F',
      `F${saleCellNumber} - F${expenseCellNumber}`,
      totalGross,
    );

    setTotal(
      worksheet,
      cellNumber,
      'G',
      `G${saleCellNumber} - G${expenseCellNumber}`,
      totalNet,
    );

    setTotal(
      worksheet,
      cellNumber,
      'H',
      `H${saleCellNumber} - H${expenseCellNumber}`,
      totalBtw,
    );

    setResultTitle(worksheet, cellNumber);

    setMoneyColumnsFormat(worksheet, ['F', 'G', 'H'], currency, [
      `F${cellNumber}`,
      `G${cellNumber}`,
      `H${cellNumber}`,
    ]);

    monthResults.push({
      month: item.month,
      name,
      cellNumber,
      total: {
        saleGross,
        saleNet,
        saleBtw,
        expenseGross,
        expenseNet,
        expenseBtw,
      },
    });

    resizeColumn(worksheet);
  });

  createYearSummarySheet(
    workbook,
    yearSummarySheetName,
    monthResults,
    currency,
    translate,
  );

  createQData(workbook, monthResults, currency, translate);
  setActiveMonthTab(workbook, date);

  return workbook;
};

export const createPriceWorkbook = (
  roomName: string,
  currency: ICurrencyAll,
  treatmentList: ITreatmentAll[],
  additionalList: IAdditionalAll[],
  priceListTranslate: PriceListTranslations,
): Workbook => {
  const workbook = new Workbook();
  const worksheet = workbook.addWorksheet(priceListTranslate.TITLE);

  worksheet.columns = [
    {
      key: priceListTranslate.ORDER,
      width: 10,
    },
    {
      key: priceListTranslate.NAME,
      width: 45,
    },
    {
      key: priceListTranslate.PRICE,
      width: 15,
    },
  ];

  addPriceHeader(worksheet, roomName, currency, priceListTranslate);
  addPriceTreatments(worksheet, currency, treatmentList, priceListTranslate);
  addAdditionalList(worksheet, currency, additionalList, priceListTranslate);

  setColumnFormat(worksheet, ['C'], currencyFormat(currencySymbol(currency)));

  return workbook;
};

const addPriceHeader = (
  worksheet: Worksheet,
  roomName: string,
  currency: ICurrencyAll,
  priceListTranslate: PriceListTranslations,
): Worksheet => {
  const roomRow = worksheet.addRow([priceListTranslate.ROOM, roomName]);

  roomRow.getCell(1).font = { bold: true };
  roomRow.getCell(1).alignment = { vertical: 'middle' };

  const currencyRow = worksheet.addRow([
    priceListTranslate.CURRENCY,
    `${currency.name} (${currency.code})`,
  ]);

  currencyRow.getCell(1).font = { bold: true };

  worksheet.addRow([]);

  return worksheet;
};

const addPriceTreatments = (
  worksheet: Worksheet,
  currency: ICurrencyAll,
  treatmentList: ITreatmentAll[],
  priceListTranslate: PriceListTranslations,
): void => {
  const treatments = treatmentList.filter(
    (treatment) => treatment.price !== null,
  );

  const titleRow = worksheet.addRow([]);
  setPriceSectionTitle(
    worksheet,
    titleRow.number,
    priceListTranslate.TREATMENT_LIST,
  );

  const groups = new Map<string, ITreatmentAll[]>();

  for (const treatment of treatments) {
    const groupId = treatment.group.id;

    if (!groups.has(groupId)) {
      groups.set(groupId, []);
    }

    groups.get(groupId)!.push(treatment);
  }

  for (const groupTreatments of groups.values()) {
    const group = groupTreatments[0].group;

    const groupTitleRow = worksheet.addRow([]);
    setPriceGroupTitle(worksheet, groupTitleRow.number, group.name.trim());

    addPriceRows(
      worksheet,
      groupTreatments
        .slice()
        .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
        .map((treatment) => ({
          order: treatment.order,
          name: treatment.name.trim(),
          price: treatment.price!,
        })),
      priceListTranslate,
    );

    worksheet.addRow([]);
  }
};

const addAdditionalList = (
  worksheet: Worksheet,
  currency: ICurrencyAll,
  additionalList: IAdditionalAll[],
  priceListTranslate: PriceListTranslations,
): void => {
  const titleRow = worksheet.addRow([]);

  setPriceSectionTitle(
    worksheet,
    titleRow.number,
    priceListTranslate.ADDITIONAL_LIST,
  );

  const additionals = additionalList
    .filter((additional) => additional.price !== null)
    .sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  addPriceRows(
    worksheet,
    additionals.map((additional) => ({
      order: additional.order,
      name: additional.name.trim(),
      price: additional.price!,
    })),
    priceListTranslate,
  );
};

const addPriceRows = (
  worksheet: Worksheet,
  rows: IPriceRow[],
  priceListTranslate: PriceListTranslations,
): void => {
  const headerRow = worksheet.addRow([
    priceListTranslate.ORDER,
    priceListTranslate.NAME,
    priceListTranslate.PRICE,
  ]);

  setPriceTableHeader(worksheet, headerRow.number);

  if (!rows.length) {
    return;
  }

  const startRow = worksheet.rowCount + 1;

  for (const item of rows) {
    const row = worksheet.addRow([item.order, item.name, item.price]);

    row.getCell(1).alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };

    row.getCell(2).alignment = {
      horizontal: 'left',
      vertical: 'middle',
    };

    row.getCell(3).alignment = {
      horizontal: 'right',
      vertical: 'middle',
    };
  }

  setPriceTableBorders(worksheet, startRow, worksheet.rowCount);
};

const setPriceSectionTitle = (
  worksheet: Worksheet,
  rowNumber: number,
  title: string,
): void => {
  worksheet.mergeCells(`A${rowNumber}:C${rowNumber}`);

  const cell = worksheet.getCell(`A${rowNumber}`);
  cell.value = title;

  cell.font = {
    bold: true,
    size: 14,
  };

  cell.alignment = {
    horizontal: 'center',
    vertical: 'middle',
  };

  setFill(cell, 'b5ac9e');
  setAllBorders(cell);
};

const setPriceGroupTitle = (
  worksheet: Worksheet,
  rowNumber: number,
  title: string,
): void => {
  worksheet.mergeCells(`A${rowNumber}:C${rowNumber}`);

  const cell = worksheet.getCell(`A${rowNumber}`);
  cell.value = title;

  cell.font = {
    bold: true,
    size: 12,
  };

  cell.alignment = {
    horizontal: 'left',
    vertical: 'middle',
  };

  setFill(cell, 'dcc8c2');
  setAllBorders(cell);
};

const setPriceTableHeader = (worksheet: Worksheet, rowNumber: number): void => {
  const headers = worksheet.getRow(rowNumber);

  headers.font = {
    bold: true,
  };

  headers.alignment = {
    vertical: 'middle',
  };

  headers.eachCell((cell, index) => {
    cell.border = {
      top: { style: 'thin' },
      bottom: { style: 'thin' },
      left: {
        style: index === 1 ? 'medium' : 'thin',
      },
      right: {
        style: index === 3 ? 'medium' : 'thin',
      },
    };

    setFill(cell, 'ffd38c');
  });
};

const setPriceTableBorders = (
  worksheet: Worksheet,
  startRow: number,
  endRow: number,
): void => {
  for (let rowNumber = startRow; rowNumber <= endRow; rowNumber++) {
    const row = worksheet.getRow(rowNumber);

    row.eachCell((cell, columnNumber) => {
      cell.border = {
        left: {
          style: columnNumber === 1 ? 'medium' : 'thin',
        },
        right: {
          style: columnNumber === 3 ? 'medium' : 'thin',
        },
        bottom: {
          style: rowNumber === endRow ? 'medium' : 'thin',
        },
      };

      cell.alignment = {
        vertical: 'middle',
      };
    });
  }
};

const monthlyIncomeWorksheet = (
  workbook: Workbook,
  header: string,
  data: IMonthlySummarySale[],
  weeks: any[],
  title: string,
  type: string,
  name: string,
  translate: TranslateService,
  currency: string,
  timeZone: string,
  env: EnvService,
): Worksheet => {
  return createMonthlyWorksheet(
    workbook,
    header,
    data,
    weeks,
    title,
    name,
    translate,
    currency,
    timeZone,
    env,
    {
      type,
      headers: [
        'DATE',
        'CUSTOMER',
        'DESCRIPTION',
        'DISCOUNT',
        'COLOR',
        'TYPE',
        'GROSS',
        'NET',
        'BTW',
      ],
      getPayments: (income) => (income as IMonthlySummarySale).total.payments,
      buildRows: (item, translate, timeZone, env) =>
        buildIncomeRows(
          item as IMonthlySummarySale,
          translate,
          timeZone,
          env,
          type,
        ),
    },
  );
};

const monthlyExpenseWorksheet = (
  workbook: Workbook,
  header: string,
  data: IMonthlySummaryExpense[],
  weeks: any[],
  title: string,
  name: string,
  translate: TranslateService,
  currency: string,
  timeZone: string,
  env: EnvService,
): Worksheet => {
  return createMonthlyWorksheet(
    workbook,
    header,
    data,
    weeks,
    title,
    name,
    translate,
    currency,
    timeZone,
    env,
    {
      type: SummaryType.expense,
      headers: [
        'DATE',
        'INVOICE',
        'SUPPLY_STORE',
        'DESCRIPTION',
        'TYPE',
        'SUB_TYPE',
        'GROSS',
        'NET',
        'BTW',
      ],
      getPayments: (expense) =>
        (expense as IMonthlySummaryExpense).total.payments,
      buildRows: (item, translate, timeZone, env) =>
        buildExpenseRows(
          item as IMonthlySummaryExpense,
          translate,
          timeZone,
          env,
        ),
    },
  );
};

const createMonthlyWorksheet = (
  workbook: Workbook,
  header: string,
  data: (IMonthlySummarySale | IMonthlySummaryExpense)[],
  weeks: any[],
  title: string,
  name: string,
  translate: TranslateService,
  currency: string,
  timeZone: string,
  env: EnvService,
  config: IMonthlyWorksheetConfig,
): Worksheet => {
  const worksheet = workbook.addWorksheet(`${name} - ${header}`);

  let cellNumber = 1;

  setTitle(worksheet, cellNumber, 'K', title);

  cellNumber++;

  createHeader(worksheet, config.headers, translate);

  setSubtitle(worksheet, cells, cellNumber);

  cellNumber++;

  let totals: IMoneyTotal = {
    gross: 0,
    net: 0,
    btw: 0,
  };

  let totalRow = 0;

  weeks.forEach((week, index) => {
    setWeek(worksheet, cellNumber, index, 'K', translate);

    const rowData = data.filter((item) => week.dates.includes(item.day));

    if (!rowData.length) {
      cellNumber++;
      return;
    }

    let rowIndex = 0;

    rowData.forEach((item) => {
      const result = config.buildRows(item, translate, timeZone, env);

      totals = addMoneyTotals(totals, result.total);

      result.rows.forEach((rowData) => {
        rowIndex++;
        totalRow++;

        const row = worksheet.addRow([totalRow, ...rowData]);

        setLinkFont(row);
      });

      if (result.rowCount > 1) {
        const start = rowIndex - result.rowCount + cellNumber + 1;
        const end = start + result.rowCount - 1;

        mergeColumns(worksheet, result.mergeColumns, start, end);

        // The N° column is always merged.
        worksheet.mergeCells(`A${start}`, `A${end}`);
      }
    });

    const init = ++cellNumber;
    cellNumber += rowIndex;

    setBorder(worksheet, init, cellNumber - 1, cells);
  });

  worksheet.mergeCells(`A${cellNumber}`, `H${cellNumber}`);

  setResultTitle(worksheet, cellNumber);

  setMonthlyTotalCells(worksheet, cellNumber, totals);

  setMoneyColumnsFormat(worksheet, ['I', 'J', 'K'], currency);

  const idColumn = worksheet.getColumn('B');

  idColumn.alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };

  resizeColumn(worksheet);

  return worksheet;
};

const buildIncomeRows = (
  income: IMonthlySummarySale,
  translate: TranslateService,
  timeZone: string,
  env: EnvService,
  type: string,
): IMonthlyRowResult => {
  const link = createLink(income.id, income.paths, env);

  const payments = income.total.payments;

  if (!payments.length) {
    const total = {
      gross: income.total.gross,
      net: income.total.net,
      btw: income.total.btw,
    };

    return {
      rows: [
        [
          link,
          exportDate(income.timestamp, timeZone),
          income.customerName,
          income.description,
          income.total.discountDescription,
          income.color,
          translate.instant(getTranslateTypeKey(type)),
          total.gross,
          total.net,
          total.btw,
        ],
      ],
      rowCount: 1,
      total,
      mergeColumns: [],
    };
  }

  const rows = payments.map((payment) => [
    link,
    exportDate(income.timestamp, timeZone),
    income.customerName,
    income.description,
    income.total.discountDescription,
    income.color,
    translate.instant(getTranslateTypeKey(type, payment.paymentType)),
    payment.gross,
    payment.net,
    payment.btw,
  ]);

  return {
    rows,
    rowCount: rows.length,
    total: sumPayments(payments),
    mergeColumns: ['B', 'C', 'D', 'E', 'F', 'G', 'H'],
  };
};

const buildExpenseRows = (
  expense: IMonthlySummaryExpense,
  translate: TranslateService,
  timeZone: string,
  env: EnvService,
): IMonthlyRowResult => {
  const link = createLink(expense.id, expense.paths, env);

  const payments = expense.total.payments;

  const rows = payments.map((payment) => [
    link,
    exportDate(expense.timestamp, timeZone, true),
    expense.invoice,
    expense.supplyStore,
    payment.description,
    translate.instant(
      getTranslateTypeKey(SummaryType.expense, payment.expenseType),
    ),
    translate.instant(
      getTranslateTypeKey(SummaryType.expense, payment.expenseSubType),
    ),
    payment.gross,
    payment.net,
    payment.btw,
  ]);

  return {
    rows,
    rowCount: rows.length,
    total: sumPayments(payments),
    mergeColumns: ['B', 'C', 'D', 'E', 'F', 'G'],
  };
};

const createLink = (
  id: string,
  paths: string | string[],
  env: EnvService,
): CellHyperlinkValue => ({
  text: id,
  hyperlink: `${env.appServer}/${Array.isArray(paths) ? paths.join('/') : paths}`,
});

const exportDate = (
  timestamp: number,
  timeZone: string,
  zoned: boolean = false,
): string => {
  const date = zoned
    ? createNewDateZonedTime(timestamp, timeZone)
    : newDateTimestamp(timestamp, timeZone);

  return exportFormatDate(date, DEFAULT_LOCALE, timeZone);
};

const sumPayments = (payments: ISummaryTotal[]): IMoneyTotal => {
  return payments.reduce(
    (total, payment) => ({
      gross: total.gross + payment.gross,
      net: total.net + payment.net,
      btw: total.btw + payment.btw,
    }),
    {
      gross: 0,
      net: 0,
      btw: 0,
    },
  );
};

const addMoneyTotals = (
  first: IMoneyTotal,
  second: IMoneyTotal,
): IMoneyTotal => ({
  gross: first.gross + second.gross,
  net: first.net + second.net,
  btw: first.btw + second.btw,
});

const mergeColumns = (
  worksheet: Worksheet,
  columns: string[],
  start: number,
  end: number,
): void => {
  if (start === end) {
    return;
  }

  columns.forEach((column) => {
    worksheet.mergeCells(`${column}${start}`, `${column}${end}`);
  });
};

const setMonthlyTotalCells = (
  worksheet: Worksheet,
  row: number,
  totals: IMoneyTotal,
): void => {
  setTotal(worksheet, row, 'I', `SUM(I3:I${row - 1})`, totals.gross, 'K');

  setTotal(worksheet, row, 'J', `SUM(J3:J${row - 1})`, totals.net, 'K');

  setTotal(worksheet, row, 'K', `SUM(K3:K${row - 1})`, totals.btw, 'K');
};

const createHeader = (
  worksheet: Worksheet,
  headers: string[],
  translate: TranslateService,
): void => {
  worksheet.addRow([
    'N°',
    'Link',
    ...headers.map((key) => translate.instant(`SUMMARY.MONTHLY.TABLE.${key}`)),
  ]);
};

const setColumnFormat = (
  worksheet: Worksheet,
  columns: string[],
  format: string,
): void => {
  columns.forEach((column) => (worksheet.getColumn(column).numFmt = format));
};

const setCellFormat = (
  worksheet: Worksheet,
  cells: string[],
  format: string,
): void => {
  cells.forEach((cell) => (worksheet.getCell(cell).numFmt = format));
};

const setMoneyColumnsFormat = (
  worksheet: Worksheet,
  columns: string[],
  currency: string,
  positiveCells: string[] = [],
): void => {
  setColumnFormat(worksheet, columns, currencyFormat(currency));

  if (positiveCells.length) {
    setCellFormat(worksheet, positiveCells, currencyFormat(currency, true));
  }
};

const completeData = (
  workbook: Workbook,
  date: Date,
  data: IMonthlyExport[],
): IMonthlyExport[] => {
  for (let i = 12; i >= 1; i--) {
    if (i % 3 === 0) {
      workbook.addWorksheet(`Q${i / 3}`);
    }

    const name = monthViewTitle(new Date(date.getFullYear(), i - 1));

    workbook.addWorksheet(name);

    if (!data.find((item) => item.month === i)) {
      data = [
        ...data,
        {
          month: i,
          expenseSummary: [],
          saleSummary: [],
          cashSummary: [],
        },
      ];
    }
  }

  return data.sort((a, b) => a.month - b.month);
};

const addData = (
  worksheet: Worksheet,
  key: string,
  cellNumber: number,
  column4Name: string,
  column5Name: string,
  rowData: (CellHyperlinkValue | string | number)[][],
  gross: number,
  net: number,
  btw: number,
  translate: TranslateService,
): number => {
  setTitle(worksheet, cellNumber, 'H', translate.instant(key));

  const dateTitle = translate.instant('SUMMARY.MONTHLY.TABLE.DATE');

  const grossTitle = translate.instant('SUMMARY.MONTHLY.TABLE.GROSS');

  const netTitle = translate.instant('SUMMARY.MONTHLY.TABLE.NET');

  const btwTitle = translate.instant('SUMMARY.MONTHLY.TABLE.BTW');

  worksheet.addRow([
    'N°',
    'ID',
    dateTitle,
    translate.instant(column4Name),
    translate.instant(column5Name),
    grossTitle,
    netTitle,
    btwTitle,
  ]);

  cellNumber++;

  setSubtitle(worksheet, monthCells, cellNumber);

  const init = ++cellNumber;

  if (rowData.length) {
    const rows = worksheet.addRows(rowData);

    rows.forEach((row) => setLinkFont(row));

    cellNumber += rowData.length;

    setBorder(worksheet, init, cellNumber - 1, monthCells);

    worksheet.mergeCells(`A${cellNumber}`, `E${cellNumber}`);

    setTotal(
      worksheet,
      cellNumber,
      'F',
      `SUM(F${init}:F${cellNumber - 1})`,
      gross,
    );

    setTotal(
      worksheet,
      cellNumber,
      'G',
      `SUM(G${init}:G${cellNumber - 1})`,
      net,
    );

    setTotal(
      worksheet,
      cellNumber,
      'H',
      `SUM(H${init}:H${cellNumber - 1})`,
      btw,
    );

    setResultTitle(worksheet, cellNumber, 'Total');
  } else {
    setTitle(worksheet, cellNumber, 'H', 'No data', 'A', 'f08080');
  }

  return cellNumber;
};

const setTitle = (
  worksheet: Worksheet,
  cellNumber: number,
  endLetter: string,
  key: string,
  startLetter: string = 'A',
  color: string = 'b5ac9e',
): void => {
  worksheet.mergeCells(
    `${startLetter}${cellNumber}`,
    `${endLetter}${cellNumber}`,
  );

  const titleCell = worksheet.getCell(`${startLetter}${cellNumber}`);

  titleCell.value = key;

  setTitleFormat(titleCell, color);

  titleCell.border = {
    top: { style: 'medium' },
    left: { style: 'medium' },
    right: { style: 'medium' },
  };
};

const setSubtitle = (
  worksheet: Worksheet,
  cellList: string[],
  cellNumber: number,
): void => {
  cellList.forEach((cell, index) => {
    const currentCell = worksheet.getCell(`${cell}${cellNumber}`);

    setTitleFormat(currentCell, 'dcc8c2');

    currentCell.border = {
      left: {
        style: index === 0 ? 'medium' : 'thin',
      },
      right: {
        style: index === cellList.length - 1 ? 'medium' : 'thin',
      },
      top: { style: 'thin' },
      bottom: { style: 'thin' },
    };
  });
};

const getTranslateTypeKey = (key: string, type: string = 'PENDING'): string =>
  `COMMON.${key.toUpperCase()}.TYPE.${type}`;

const getSaleRowData = (
  saleSummary: IMonthlySummarySale[],
  timeZone: string,
  env: EnvService,
): {
  saleRowData: (string | number | CellHyperlinkValue)[][];
  saleGross: number;
  saleBtw: number;
  saleNet: number;
} => {
  let total: IMoneyTotal = {
    gross: 0,
    net: 0,
    btw: 0,
  };

  const rowData = saleSummary.map((sale, index) => {
    const id = createLink(sale.id, sale.paths, env);

    const paid = sumPayments(sale.total.payments);

    total = addMoneyTotals(total, paid);

    return [
      index + 1,
      id,
      exportDate(sale.timestamp, timeZone),
      sale.customerName,
      sale.description,
      paid.gross,
      paid.net,
      paid.btw,
    ];
  });

  return {
    saleRowData: rowData,
    saleGross: total.gross,
    saleNet: total.net,
    saleBtw: total.btw,
  };
};

const getExpenseRowData = (
  expenseSummary: IMonthlySummaryExpense[],
  timeZone: string,
  env: EnvService,
): {
  expenseRowData: (string | number | CellHyperlinkValue)[][];
  expenseGross: number;
  expenseBtw: number;
  expenseNet: number;
} => {
  let total: IMoneyTotal = {
    gross: 0,
    net: 0,
    btw: 0,
  };

  const rowData = expenseSummary.map((expense, index) => {
    const id = createLink(expense.id, expense.paths, env);

    total = addMoneyTotals(total, {
      gross: expense.total.gross,
      net: expense.total.net,
      btw: expense.total.btw,
    });

    return [
      index + 1,
      id,
      exportDate(expense.timestamp, timeZone, true),
      expense.invoice,
      expense.supplyStore,
      expense.total.gross,
      expense.total.net,
      expense.total.btw,
    ];
  });

  return {
    expenseRowData: rowData,
    expenseGross: total.gross,
    expenseNet: total.net,
    expenseBtw: total.btw,
  };
};

const createQData = (
  workbook: Workbook,
  monthResults: IMonthResult[],
  currency: string,
  translate: TranslateService,
): void => {
  [...Array(4)].forEach((_, index) => {
    const quarter = index + 1;
    const name = `Q${quarter}`;
    const worksheet = workbook.getWorksheet(name);

    if (!worksheet) {
      return;
    }

    setQTitles(worksheet, name, translate);

    const qTotal: ITotal = {
      saleGross: 0,
      saleNet: 0,
      saleBtw: 0,
      expenseGross: 0,
      expenseNet: 0,
      expenseBtw: 0,
    };

    monthResults
      .filter(
        (item) => item.month <= quarter * 3 && item.month > (quarter - 1) * 3,
      )
      .forEach((item, monthIndex) => {
        const total = item.total;

        const incomeRow = monthIndex + 3;
        const expenseRow = monthIndex + 10;
        const totalRow = monthIndex + 17;

        qTotal.saleGross += total.saleGross;
        qTotal.saleNet += total.saleNet;
        qTotal.saleBtw += total.saleBtw;

        qTotal.expenseGross += total.expenseGross;
        qTotal.expenseNet += total.expenseNet;
        qTotal.expenseBtw += total.expenseBtw;

        worksheet.getRow(incomeRow).values = [
          item.name,
          total.saleGross,
          total.saleNet,
          total.saleBtw,
        ];

        worksheet.getRow(expenseRow).values = [
          item.name,
          total.expenseGross,
          total.expenseNet,
          total.expenseBtw,
        ];

        worksheet.getCell(`A${totalRow}`).value = item.name;

        setTotal(
          worksheet,
          totalRow,
          'B',
          `B${incomeRow} - B${expenseRow}`,
          total.saleGross - total.expenseGross,
          'D',
          false,
        );

        setTotal(
          worksheet,
          totalRow,
          'C',
          `C${incomeRow} - C${expenseRow}`,
          total.saleNet - total.expenseNet,
          'D',
          false,
        );

        setTotal(
          worksheet,
          totalRow,
          'D',
          `D${incomeRow} - D${expenseRow}`,
          total.saleBtw - total.expenseBtw,
          'D',
          false,
        );
      });

    setQ(worksheet, qTotal, currency);

    resizeColumn(worksheet);
  });
};

const createYearSummarySheet = (
  workbook: Workbook,
  sheetName: string,
  monthResults: IMonthResult[],
  currency: string,
  translate: TranslateService,
): void => {
  const worksheet = workbook.getWorksheet(sheetName);

  if (!worksheet) {
    return;
  }

  const title = translate.instant('SUMMARY.YEAR.RESULT');

  setTitle(worksheet, 1, 'J', title);

  const monthTitle = translate.instant('SUMMARY.MONTHLY.TABLE.MONTH');

  const grossTitle = translate.instant('SUMMARY.MONTHLY.TABLE.GROSS');

  const netTitle = translate.instant('SUMMARY.MONTHLY.TABLE.NET');

  const btwTitle = translate.instant('SUMMARY.MONTHLY.TABLE.BTW');

  const incomeTitle = translate.instant('SUMMARY.INCOMES');

  const expenseTitle = translate.instant('SUMMARY.EXPENSES');

  worksheet.addRow([
    monthTitle,
    `${incomeTitle} ${grossTitle}`,
    `${incomeTitle} ${netTitle}`,
    `${incomeTitle} ${btwTitle}`,
    `${expenseTitle} ${grossTitle}`,
    `${expenseTitle} ${netTitle}`,
    `${expenseTitle} ${btwTitle}`,
    `Result ${grossTitle}`,
    `Result ${netTitle}`,
    `Result ${btwTitle}`,
  ]);

  setSubtitle(worksheet, yearCells, 2);

  const startRow = 3;

  monthResults.forEach((item) => {
    worksheet.addRow([
      item.name,
      item.total.saleGross,
      item.total.saleNet,
      item.total.saleBtw,
      item.total.expenseGross,
      item.total.expenseNet,
      item.total.expenseBtw,
      item.total.saleGross - item.total.expenseGross,
      item.total.saleNet - item.total.expenseNet,
      item.total.saleBtw - item.total.expenseBtw,
    ]);
  });

  const endRow = startRow + monthResults.length - 1;

  if (monthResults.length) {
    setBorder(worksheet, startRow, endRow, yearCells);
  }

  const totalRow = endRow + 1;

  setResultTitle(worksheet, totalRow, translate.instant('SUMMARY.TOTAL'));

  const totals = calculateYearTotals(monthResults);

  const columns = ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];

  const results = [
    totals.income.gross,
    totals.income.net,
    totals.income.btw,
    totals.expense.gross,
    totals.expense.net,
    totals.expense.btw,
    totals.result.gross,
    totals.result.net,
    totals.result.btw,
  ];

  columns.forEach((column, index) => {
    setTotal(
      worksheet,
      totalRow,
      column,
      `SUM(${column}${startRow}:${column}${endRow})`,
      results[index],
      'J',
    );
  });

  setMoneyColumnsFormat(
    worksheet,
    columns,
    currency,
    columns.map((column) => `${column}${totalRow}`),
  );

  resizeColumn(worksheet);
};

const calculateYearTotals = (
  monthResults: IMonthResult[],
): {
  income: IMoneyTotal;
  expense: IMoneyTotal;
  result: IMoneyTotal;
} => {
  const income = monthResults.reduce(
    (total, item) =>
      addMoneyTotals(total, {
        gross: item.total.saleGross,
        net: item.total.saleNet,
        btw: item.total.saleBtw,
      }),
    emptyMoneyTotal(),
  );

  const expense = monthResults.reduce(
    (total, item) =>
      addMoneyTotals(total, {
        gross: item.total.expenseGross,
        net: item.total.expenseNet,
        btw: item.total.expenseBtw,
      }),
    emptyMoneyTotal(),
  );

  return {
    income,
    expense,
    result: {
      gross: income.gross - expense.gross,
      net: income.net - expense.net,
      btw: income.btw - expense.btw,
    },
  };
};

const setActiveMonthTab = (workbook: Workbook, date: Date): void => {
  const activeMonthName = monthViewTitle(
    new Date(date.getFullYear(), date.getMonth()),
  );

  const activeIndex = workbook.worksheets.findIndex(
    (sheet) => sheet.name === activeMonthName,
  );

  if (activeIndex < 0) {
    return;
  }

  workbook.views = [
    {
      x: 0,
      y: 0,
      width: 48000,
      height: 24000,
      firstSheet: 0,
      activeTab: activeIndex,
      visibility: 'visible',
    },
  ];

  const activeSheet = workbook.worksheets[activeIndex];

  if (!activeSheet) {
    return;
  }

  const selectedView = {
    state: 'normal',
    rightToLeft: false,
    activeCell: 'A1',
    showRuler: true,
    showRowColHeaders: true,
    showGridLines: true,
    zoomScale: 100,
    zoomScaleNormal: 100,
  } as WorksheetView;

  activeSheet.views = [selectedView];
};

const setQ = (worksheet: Worksheet, qTotal: ITotal, currency: string): void => {
  setColumnFormat(worksheet, ['B', 'C', 'D'], currencyFormat(currency));

  const positivePriceFormat = currencyFormat(currency, true);

  setQTotals(
    worksheet,
    qTotal.saleGross,
    qTotal.saleNet,
    qTotal.saleBtw,
    3,
    positivePriceFormat,
  );

  setQTotals(
    worksheet,
    qTotal.expenseGross,
    qTotal.expenseNet,
    qTotal.expenseBtw,
    10,
    positivePriceFormat,
    true,
  );

  setQTotals(
    worksheet,
    qTotal.saleGross - qTotal.expenseGross,
    qTotal.saleNet - qTotal.expenseNet,
    qTotal.saleBtw - qTotal.expenseBtw,
    17,
    positivePriceFormat,
  );
};

const setQTotals = (
  worksheet: Worksheet,
  gross: number,
  net: number,
  btw: number,
  startSumCell: number,
  positivePriceFormat: string,
  isNegative: boolean = false,
): void => {
  const endSumCell = startSumCell + 2;

  const totalCell = startSumCell + 3;

  setBorder(worksheet, startSumCell, totalCell, qCells);

  const prefix = isNegative ? '-' : '';

  setTotal(
    worksheet,
    totalCell,
    'B',
    `${prefix}SUM(B${startSumCell}:B${endSumCell})`,
    gross,
    'D',
  );

  setTotal(
    worksheet,
    totalCell,
    'C',
    `${prefix}SUM(C${startSumCell}:C${endSumCell})`,
    net,
    'D',
  );

  setTotal(
    worksheet,
    totalCell,
    'D',
    `${prefix}SUM(D${startSumCell}:D${endSumCell})`,
    btw,
    'D',
  );

  setResultTitle(worksheet, totalCell);

  setCellFormat(
    worksheet,
    [`B${totalCell}`, `C${totalCell}`, `D${totalCell}`],
    positivePriceFormat,
  );
};

const setResultTitle = (
  worksheet: Worksheet,
  cellNumber: number,
  value: string = 'Result',
): void => {
  const resultCellTitle = worksheet.getCell(`A${cellNumber}`);

  resultCellTitle.value = value;

  resultCellTitle.alignment = {
    vertical: 'middle',
    horizontal: 'right',
  };

  setAllBorders(resultCellTitle);

  setFill(resultCellTitle, 'dcc8c2');
};

const getTotalOrZero = (totals: ISummaryTotal[], type: string): IMoneyTotal =>
  totals
    .filter((total) => total.type === type)
    .reduce(
      (acc, total) => ({
        gross: acc.gross + total.gross,
        btw: acc.btw + total.btw,
        net: acc.net + total.net,
      }),
      emptyMoneyTotal(),
    );

const setQTitles = (
  worksheet: Worksheet,
  name: string,
  translate: TranslateService,
): void => {
  setTitle(worksheet, 1, 'D', translate.instant('SUMMARY.INCOMES'));

  const monthTitle = translate.instant('SUMMARY.MONTHLY.TABLE.MONTH');

  const grossTitle = translate.instant('SUMMARY.MONTHLY.TABLE.GROSS');

  const netTitle = translate.instant('SUMMARY.MONTHLY.TABLE.NET');

  const btwTitle = translate.instant('SUMMARY.MONTHLY.TABLE.BTW');

  worksheet.addRow([monthTitle, grossTitle, netTitle, btwTitle]);

  setSubtitle(worksheet, qCells, 2);

  setTitle(worksheet, 8, 'D', translate.instant('SUMMARY.EXPENSES'));

  worksheet.addRow([monthTitle, grossTitle, netTitle, btwTitle]);

  setSubtitle(worksheet, qCells, 9);

  setTitle(worksheet, 15, 'D', name);

  worksheet.addRow([monthTitle, grossTitle, netTitle, btwTitle]);

  setSubtitle(worksheet, qCells, 16);
};

const setWeek = (
  worksheet: Worksheet,
  cellNumber: number,
  index: number,
  endLetter: string,
  translate: TranslateService,
): void => {
  worksheet.mergeCells(`A${cellNumber}`, `${endLetter}${cellNumber}`);

  const weekCell = worksheet.getCell(`A${cellNumber}`);

  weekCell.value = translate.instant('SUMMARY.MONTHLY.TABLE.WEEK', {
    weekNumber: index + 1,
  });

  setTitleFormat(weekCell, 'ffd38c');

  setAllBorders(weekCell);
};

const setTotal = (
  worksheet: Worksheet,
  cellNumber: number,
  letter: string,
  formula: string,
  result: number,
  endBorder: string = 'H',
  format: boolean = true,
): void => {
  const totalCell = worksheet.getCell(`${letter}${cellNumber}`);

  totalCell.value = {
    formula,
    result,
  } as CellFormulaValue;

  if (!format) {
    return;
  }

  totalCell.font = {
    bold: true,
  };

  totalCell.border = {
    top: {
      style: 'double',
    },
    bottom: {
      style: 'medium',
    },
    right: {
      style: letter === endBorder ? 'medium' : 'thin',
    },
  };

  setFill(totalCell, 'dcc8c2');
};

const setAllBorders = (cell: Cell): void => {
  cell.border = {
    bottom: {
      style: 'medium',
    },
    left: {
      style: 'medium',
    },
    right: {
      style: 'medium',
    },
    top: {
      style: 'medium',
    },
  };
};

const setFill = (cell: Cell, color: string): void => {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: {
      argb: color,
    },
  };
};

const setTitleFormat = (titleCell: Cell, color: string): void => {
  titleCell.alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };

  setFill(titleCell, color);
};

const setLinkFont = (row: Row, cell: string = 'B'): void => {
  const idRowCell = row.getCell(cell);

  idRowCell.font = {
    color: {
      argb: 'FF0000FF',
    },
    underline: true,
  };
};

const setBorder = (
  worksheet: Worksheet,
  start: number,
  end: number,
  cellList: string[],
): void => {
  cellList.forEach((cell, index) => {
    const length = Math.abs(end - start) + 1;

    Array.from({ length }, (_, i) => start + i).forEach((cellNumber) => {
      const currentCell = worksheet.getCell(`${cell}${cellNumber}`);

      currentCell.border = {
        left: {
          style: index === 0 ? 'medium' : 'thin',
        },
        right: {
          style: index === cellList.length - 1 ? 'medium' : 'thin',
        },
      };

      currentCell.alignment = {
        vertical: 'middle',
      };
    });
  });
};

const resizeColumn = (worksheet: Worksheet): void => {
  worksheet.columns.forEach((column: any) => {
    if (!column.values) {
      return;
    }

    const lengths = column.values.map((value: any) => {
      if (value && typeof value === 'object' && 'text' in value) {
        return value.text?.toString()?.length || 0;
      }

      return value?.toString()?.length || 0;
    });

    const numericLengths = lengths.filter(
      (value: any) => typeof value === 'number',
    );

    if (numericLengths.length) {
      column.width = Math.max(...numericLengths);
    }
  });
};

const currencyFormat = (
  currency: string,
  positiveColor: boolean = false,
): string =>
  `${
    positiveColor ? '[Blue]' : ''
  }"${currency} "#,##0.00;[Red]\\("${currency} "#,##0.00\\)`;

const emptyMoneyTotal = (): IMoneyTotal => ({
  gross: 0,
  net: 0,
  btw: 0,
});
