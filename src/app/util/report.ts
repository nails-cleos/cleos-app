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
  DEFAULT_LOCALE,
  createNewDateZonedTime,
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
import { titleCase } from './helper';
import { EnvService } from '../services/env.service';

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

  monthSummaries.forEach((it, index) => {
    const month = monthViewTitle(new Date(year, it.month - 1));
    const incomes = getTotalOrZero(it.total, 'INCOME');
    const expense = getTotalOrZero(it.total, 'EXPENSE');
    const diffGross = diff(incomes.gross, expense.gross);
    const diffNet = diff(incomes.net, expense.net);
    const diffBtw = diff(incomes.btw, expense.btw);

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
    worksheet.getRow(17 + index).values = [month, diffGross, diffNet, diffBtw];
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
  let monthResults: IMonthResult[] = [];
  completeData(workbook, date, data).forEach((it) => {
    const name = monthViewTitle(new Date(date.getFullYear(), it.month - 1));
    const worksheet = workbook.getWorksheet(name);
    if (worksheet) {
      const { saleRowData, saleGross, saleNet, saleBtw } = getSaleRowData(
        it.saleSummary,
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

      // Add 1 extra cell
      cellNumber += 2;

      const { expenseRowData, expenseGross, expenseNet, expenseBtw } =
        getExpenseRowData(it.expenseSummary, timeZone, env);
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
      idColumn.alignment = { vertical: 'middle', horizontal: 'center' };

      const expenseCellNumber = cellNumber;

      // Add 2 extra cells
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

      const priceFormat = currencyFormat(currency);
      setColumnFormat(worksheet, ['F', 'G', 'H'], priceFormat);

      const positivePriceFormat = currencyFormat(currency, true);
      setCellFormat(
        worksheet,
        [`F${cellNumber}`, `G${cellNumber}`, `H${cellNumber}`],
        positivePriceFormat,
      );

      monthResults = [
        ...monthResults,
        {
          month: it.month,
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
        },
      ];

      resizeColumn(worksheet);
    }
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
  const worksheet = workbook.addWorksheet(`${name} - ${header}`);
  let cellNumber = 1;
  setTitle(worksheet, cellNumber, 'K', title);
  cellNumber++;

  const headers = [
    'DATE',
    'CUSTOMER',
    'DESCRIPTION',
    'DISCOUNT',
    'COLOR',
    'TYPE',
    'GROSS',
    'NET',
    'BTW',
  ];
  createHeader(worksheet, headers, translate);
  setSubtitle(worksheet, cells, cellNumber);

  cellNumber++;
  let totalGross = 0;
  let totalNet = 0;
  let totalBtw = 0;
  let totalRow = 0;
  weeks.forEach((week, index) => {
    setWeek(worksheet, cellNumber, index, 'K', translate);

    let rowIndex = 0;
    const rowData = data.filter((item) => week.dates.includes(item.day));

    if (rowData.length) {
      rowData.forEach((income) => {
        const link = {
          text: income.id,
          hyperlink: `${env.appServer}/${income.paths}`,
        } as CellHyperlinkValue;

        if (income.total.payments.length) {
          const paymentInit = rowIndex;
          const paymentSize = income.total.payments.length;
          income.total.payments.forEach((payment: ISummaryTotal) => {
            rowIndex++;
            const typeValue = translate.instant(
              getTranslateTypeKey(type, payment.paymentType),
            );
            totalGross += payment.gross;
            totalNet += payment.net;
            totalBtw += payment.btw;
            const row = worksheet.addRow([
              ++totalRow,
              link,
              exportFormatDate(
                newDateTimestamp(income.timestamp, timeZone),
                DEFAULT_LOCALE,
                timeZone,
              ),
              income.customerName,
              income.description,
              income.total.discountDescription,
              income.color,
              typeValue,
              payment.gross,
              payment.net,
              payment.btw,
            ]);
            setLinkFont(row);
          });
          if (paymentSize > 1) {
            const start = paymentInit + cellNumber;
            worksheet.mergeCells(`A${start + 1}`, `A${start + paymentSize}`);
            worksheet.mergeCells(`B${start + 1}`, `B${start + paymentSize}`);
            worksheet.mergeCells(`D${start + 1}`, `D${start + paymentSize}`);
            worksheet.mergeCells(`E${start + 1}`, `E${start + paymentSize}`);
            worksheet.mergeCells(`F${start + 1}`, `F${start + paymentSize}`);
            worksheet.mergeCells(`G${start + 1}`, `G${start + paymentSize}`);
          }
        } else {
          totalGross += income.total.gross;
          totalNet += income.total.net;
          totalBtw += income.total.btw;
          rowIndex++;
          const typeValue = translate.instant(getTranslateTypeKey(type));
          const row = worksheet.addRow([
            ++totalRow,
            link,
            exportFormatDate(
              newDateTimestamp(income.timestamp, timeZone),
              DEFAULT_LOCALE,
              timeZone,
            ),
            income.customerName,
            income.description,
            income.total.discountDescription,
            income.color,
            typeValue,
            income.total.gross,
            income.total.net,
            income.total.btw,
          ]);
          setLinkFont(row);
        }
      });
      const init = ++cellNumber;
      cellNumber += rowIndex;
      setBorder(worksheet, init, cellNumber - 1, cells);
    } else {
      cellNumber++;
    }
  });

  worksheet.mergeCells(`A${cellNumber}`, `H${cellNumber}`);
  setResultTitle(worksheet, cellNumber);

  setTotal(
    worksheet,
    cellNumber,
    'I',
    `SUM(I${3}:I${cellNumber - 1})`,
    totalGross,
    'K',
  );
  setTotal(
    worksheet,
    cellNumber,
    'J',
    `SUM(J${3}:J${cellNumber - 1})`,
    totalNet,
    'K',
  );
  setTotal(
    worksheet,
    cellNumber,
    'K',
    `SUM(K${3}:K${cellNumber - 1})`,
    totalBtw,
    'K',
  );

  const priceFormat = currencyFormat(currency);
  setColumnFormat(worksheet, ['I', 'J', 'K'], priceFormat);

  const idColumn = worksheet.getColumn('B');
  idColumn.alignment = { vertical: 'middle', horizontal: 'center' };

  resizeColumn(worksheet);

  return worksheet;
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
  const worksheet = workbook.addWorksheet(`${name} - ${header}`);
  let cellNumber = 1;
  setTitle(worksheet, cellNumber, 'K', title);
  cellNumber++;

  const headers = [
    'DATE',
    'INVOICE',
    'SUPPLY_STORE',
    'DESCRIPTION',
    'TYPE',
    'SUB_TYPE',
    'GROSS',
    'NET',
    'BTW',
  ];
  createHeader(worksheet, headers, translate);
  setSubtitle(worksheet, cells, cellNumber);

  cellNumber++;
  let totalGross = 0;
  let totalNet = 0;
  let totalBtw = 0;
  let totalRow = 0;
  weeks.forEach((week, index) => {
    setWeek(worksheet, cellNumber, index, 'K', translate);

    let rowIndex = 0;
    const rowData = data.filter((item) => week.dates.includes(item.day));

    if (rowData.length) {
      rowData.forEach((expense) => {
        const link = {
          text: expense.id,
          hyperlink: `${env.appServer}/${expense.paths}`,
        } as CellHyperlinkValue;

        const paymentInit = rowIndex;
        const paymentSize = expense.total.payments.length;
        expense.total.payments.forEach((payment: ISummaryTotal) => {
          rowIndex++;
          const typeValue = translate.instant(
            getTranslateTypeKey(SummaryType.expense, payment.expenseType),
          );
          const subTypeValue = translate.instant(
            getTranslateTypeKey(SummaryType.expense, payment.expenseSubType),
          );
          totalGross += payment.gross;
          totalNet += payment.net;
          totalBtw += payment.btw;
          const row = worksheet.addRow([
            ++totalRow,
            link,
            exportFormatDate(
              newDateTimestamp(expense.timestamp, timeZone),
              DEFAULT_LOCALE,
              timeZone,
            ),
            expense.invoice,
            expense.supplyStore,
            payment.description,
            typeValue,
            subTypeValue,
            payment.gross,
            payment.net,
            payment.btw,
          ]);
          setLinkFont(row);
        });
        if (paymentSize > 1) {
          const start = paymentInit + cellNumber;
          worksheet.mergeCells(`A${start + 1}`, `A${start + paymentSize}`);
          worksheet.mergeCells(`B${start + 1}`, `B${start + paymentSize}`);
          worksheet.mergeCells(`C${start + 1}`, `C${start + paymentSize}`);
          worksheet.mergeCells(`D${start + 1}`, `D${start + paymentSize}`);
          worksheet.mergeCells(`E${start + 1}`, `E${start + paymentSize}`);
          worksheet.mergeCells(`F${start + 1}`, `F${start + paymentSize}`);
        }
      });
      const init = ++cellNumber;
      cellNumber += rowIndex;
      setBorder(worksheet, init, cellNumber - 1, cells);
    } else {
      cellNumber++;
    }
  });

  worksheet.mergeCells(`A${cellNumber}`, `H${cellNumber}`);
  setResultTitle(worksheet, cellNumber);

  setTotal(
    worksheet,
    cellNumber,
    'I',
    `SUM(I${3}:I${cellNumber - 1})`,
    totalNet,
    'K',
  );
  setTotal(
    worksheet,
    cellNumber,
    'J',
    `SUM(J${3}:J${cellNumber - 1})`,
    totalBtw,
    'K',
  );
  setTotal(
    worksheet,
    cellNumber,
    'K',
    `SUM(K${3}:K${cellNumber - 1})`,
    totalGross,
    'K',
  );

  const priceFormat = currencyFormat(currency);
  setColumnFormat(worksheet, ['I', 'J', 'K'], priceFormat);

  const idColumn = worksheet.getColumn('B');
  idColumn.alignment = { vertical: 'middle', horizontal: 'center' };

  resizeColumn(worksheet);

  return worksheet;
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
  columns: string[],
  format: string,
): void => {
  columns.forEach((column) => (worksheet.getCell(column).numFmt = format));
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
    if (!data.find((it) => it.month === i)) {
      data = [
        ...data,
        { month: i, expenseSummary: [], saleSummary: [], cashSummary: [] },
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

  // Add Header Rows
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
    rows.forEach((row: any) => setLinkFont(row));
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
    // no data
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
) => {
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
) => {
  cellList.forEach((cell, index) => {
    const currentCell = worksheet.getCell(`${cell}${cellNumber}`);
    setTitleFormat(currentCell, 'dcc8c2');
    currentCell.border = {
      left: { style: index === 0 ? 'medium' : 'thin' },
      right: { style: index === cellList.length - 1 ? 'medium' : 'thin' },
      top: { style: 'thin' },
      bottom: { style: 'thin' },
    };
  });
};

const getTranslateTypeKey = (key: string, type: string = 'PENDING') =>
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
  let gross = 0;
  let net = 0;
  let btw = 0;
  const rowData = saleSummary.map((sale, index) => {
    const id = {
      text: sale.id,
      hyperlink: `${env.appServer}/${sale.paths.join('/')}`,
    } as CellHyperlinkValue;

    const paid = sale.total.payments.reduce(
      (payments: any, payment: ISummaryTotal) => {
        payments.gross += payment.gross;
        payments.net += payment.net;
        payments.btw += payment.btw;
        return payments;
      },
      { gross: 0, net: 0, btw: 0 },
    );

    gross += paid.gross;
    net += paid.net;
    btw += paid.btw;

    return [
      index + 1,
      id,
      exportFormatDate(
        newDateTimestamp(sale.timestamp, timeZone),
        DEFAULT_LOCALE,
        timeZone,
      ),
      sale.customerName,
      sale.description,
      paid.gross,
      paid.net,
      paid.btw,
    ];
  });

  return { saleRowData: rowData, saleGross: gross, saleNet: net, saleBtw: btw };
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
  let gross = 0;
  let net = 0;
  let btw = 0;
  const rowData = expenseSummary.map((expense, index) => {
    const id = {
      text: expense.id,
      hyperlink: `${env.appServer}/${expense.paths.join('/')}`,
    } as CellHyperlinkValue;

    gross += expense.total.gross;
    net += expense.total.net;
    btw += expense.total.btw;

    return [
      index + 1,
      id,
      exportFormatDate(
        createNewDateZonedTime(expense.timestamp, timeZone),
        DEFAULT_LOCALE,
        timeZone,
      ),
      expense.invoice,
      expense.supplyStore,
      expense.total.gross,
      expense.total.net,
      expense.total.btw,
    ];
  });

  return {
    expenseRowData: rowData,
    expenseGross: gross,
    expenseNet: net,
    expenseBtw: btw,
  };
};

const createQData = (
  workbook: Workbook,
  monthResults: IMonthResult[],
  currency: string,
  translate: TranslateService,
) => {
  [...Array(4)].map((_, i) => {
    const name = `Q${++i}`;
    const worksheet = workbook.getWorksheet(name);
    if (worksheet) {
      setQTitles(worksheet, name, translate);

      let saleGross = 0;
      let saleNet = 0;
      let saleBtw = 0;
      let expenseGross = 0;
      let expenseNet = 0;
      let expenseBtw = 0;
      monthResults
        .filter((it) => it.month <= i * 3 && it.month > (i - 1) * 3)
        .forEach((it, index) => {
          const total = it.total;
          const incomeRow = index + 3;
          const expenseRow = index + 10;
          const totalRow = index + 17;
          saleGross += total.saleGross;
          saleNet += total.saleNet;
          saleBtw += total.saleBtw;
          expenseGross += total.expenseGross;
          expenseNet += total.expenseNet;
          expenseBtw += total.expenseBtw;
          worksheet.getRow(incomeRow).values = [
            it.name,
            total.saleGross,
            total.saleNet,
            total.saleBtw,
          ];
          worksheet.getRow(expenseRow).values = [
            it.name,
            total.expenseGross,
            total.expenseNet,
            total.expenseBtw,
          ];
          worksheet.getCell(`A${totalRow}`).value = it.name;
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

      const qTotal: ITotal = {
        saleGross,
        saleNet,
        saleBtw,
        expenseGross,
        expenseNet,
        expenseBtw,
      };
      setQ(worksheet, qTotal, currency);

      resizeColumn(worksheet);
    }
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
  monthResults.forEach((it) => {
    worksheet.addRow([
      it.name,
      it.total.saleGross,
      it.total.saleNet,
      it.total.saleBtw,
      it.total.expenseGross,
      it.total.expenseNet,
      it.total.expenseBtw,
      it.total.saleGross - it.total.expenseGross,
      it.total.saleNet - it.total.expenseNet,
      it.total.saleBtw - it.total.expenseBtw,
    ]);
  });

  const endRow = startRow + monthResults.length - 1;
  if (monthResults.length) {
    setBorder(worksheet, startRow, endRow, yearCells);
  }

  const totalRow = endRow + 1;
  const totalLabel = translate.instant('SUMMARY.TOTAL');
  setResultTitle(worksheet, totalRow, totalLabel);

  const incomeGross = monthResults.reduce(
    (acc, it) => acc + it.total.saleGross,
    0,
  );
  const incomeNet = monthResults.reduce((acc, it) => acc + it.total.saleNet, 0);
  const incomeBtw = monthResults.reduce((acc, it) => acc + it.total.saleBtw, 0);
  const expenseGross = monthResults.reduce(
    (acc, it) => acc + it.total.expenseGross,
    0,
  );
  const expenseNet = monthResults.reduce(
    (acc, it) => acc + it.total.expenseNet,
    0,
  );
  const expenseBtw = monthResults.reduce(
    (acc, it) => acc + it.total.expenseBtw,
    0,
  );
  const resultGross = incomeGross - expenseGross;
  const resultNet = incomeNet - expenseNet;
  const resultBtw = incomeBtw - expenseBtw;

  setTotal(
    worksheet,
    totalRow,
    'B',
    `SUM(B${startRow}:B${endRow})`,
    incomeGross,
    'J',
  );
  setTotal(
    worksheet,
    totalRow,
    'C',
    `SUM(C${startRow}:C${endRow})`,
    incomeNet,
    'J',
  );
  setTotal(
    worksheet,
    totalRow,
    'D',
    `SUM(D${startRow}:D${endRow})`,
    incomeBtw,
    'J',
  );
  setTotal(
    worksheet,
    totalRow,
    'E',
    `SUM(E${startRow}:E${endRow})`,
    expenseGross,
    'J',
  );
  setTotal(
    worksheet,
    totalRow,
    'F',
    `SUM(F${startRow}:F${endRow})`,
    expenseNet,
    'J',
  );
  setTotal(
    worksheet,
    totalRow,
    'G',
    `SUM(G${startRow}:G${endRow})`,
    expenseBtw,
    'J',
  );
  setTotal(
    worksheet,
    totalRow,
    'H',
    `SUM(H${startRow}:H${endRow})`,
    resultGross,
    'J',
  );
  setTotal(
    worksheet,
    totalRow,
    'I',
    `SUM(I${startRow}:I${endRow})`,
    resultNet,
    'J',
  );
  setTotal(
    worksheet,
    totalRow,
    'J',
    `SUM(J${startRow}:J${endRow})`,
    resultBtw,
    'J',
  );

  const priceFormat = currencyFormat(currency);
  setColumnFormat(
    worksheet,
    ['B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'],
    priceFormat,
  );

  const positivePriceFormat = currencyFormat(currency, true);
  setCellFormat(
    worksheet,
    [
      `B${totalRow}`,
      `C${totalRow}`,
      `D${totalRow}`,
      `E${totalRow}`,
      `F${totalRow}`,
      `G${totalRow}`,
      `H${totalRow}`,
      `I${totalRow}`,
      `J${totalRow}`,
    ],
    positivePriceFormat,
  );

  resizeColumn(worksheet);
};

const setActiveMonthTab = (workbook: Workbook, date: Date): void => {
  const activeMonthName = monthViewTitle(
    new Date(date.getFullYear(), date.getMonth()),
  );
  const activeIndex = workbook.worksheets.findIndex(
    (sheet) => sheet.name === activeMonthName,
  );
  if (activeIndex >= 0) {
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
    if (activeSheet) {
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
    }
  }
};

const setQ = (worksheet: Worksheet, qTotal: ITotal, currency: string): void => {
  const priceFormat = currencyFormat(currency);
  setColumnFormat(worksheet, ['B', 'C', 'D'], priceFormat);

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
  setTotal(
    worksheet,
    totalCell,
    'B',
    `${isNegative ? '-' : ''}SUM(B${startSumCell}:B${endSumCell})`,
    gross,
    'D',
  );
  setTotal(
    worksheet,
    totalCell,
    'C',
    `${isNegative ? '-' : ''}SUM(C${startSumCell}:C${endSumCell})`,
    net,
    'D',
  );
  setTotal(
    worksheet,
    totalCell,
    'D',
    `${isNegative ? '-' : ''}SUM(D${startSumCell}:D${endSumCell})`,
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
) => {
  const resultCellTitle = worksheet.getCell(`A${cellNumber}`);
  resultCellTitle.value = value;
  resultCellTitle.alignment = { vertical: 'middle', horizontal: 'right' };
  setAllBorders(resultCellTitle);
  setFill(resultCellTitle, 'dcc8c2');
};

const getTotalOrZero = (
  totals: ISummaryTotal[],
  type: string,
): { gross: number; btw: number; net: number } =>
  totals
    .filter((total) => total.type === type)
    .reduce(
      (acc, total) => ({
        gross: acc.gross + total.gross,
        btw: acc.btw + total.btw,
        net: acc.net + total.net,
      }),
      { gross: 0, btw: 0, net: 0 },
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
) => {
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
  if (format) {
    totalCell.font = {
      bold: true,
    };
    totalCell.border = {
      top: { style: 'double' },
      bottom: { style: 'medium' },
      right: { style: letter === endBorder ? 'medium' : 'thin' },
    };
    setFill(totalCell, 'dcc8c2');
  }
};

const setAllBorders = (cell: Cell): void => {
  cell.border = {
    bottom: { style: 'medium' },
    left: { style: 'medium' },
    right: { style: 'medium' },
    top: { style: 'medium' },
  };
};

const setFill = (cell: Cell, color: string): void => {
  cell.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: color },
  };
};

const setTitleFormat = (titleCell: Cell, color: string) => {
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  setFill(titleCell, color);
};

const setLinkFont = (row: Row, cell: string = 'B'): void => {
  const idRowCell = row.getCell(cell);
  idRowCell.font = {
    color: { argb: 'FF0000FF' },
    underline: true,
  };
};

const setBorder = (
  worksheet: Worksheet,
  start: number,
  end: number,
  cellList: string[],
) => {
  cellList.forEach((cell, index) => {
    const length = Math.abs(end - start) + 1;
    Array.from({ length }, (_, i) => start + i).forEach((cellNumber) => {
      const currentCell = worksheet.getCell(`${cell}${cellNumber}`);
      currentCell.border = {
        left: { style: index === 0 ? 'medium' : 'thin' },
        right: { style: index === cellList.length - 1 ? 'medium' : 'thin' },
      };
      currentCell.alignment = { vertical: 'middle' };
    });
  });
};

const resizeColumn = (worksheet: Worksheet) => {
  worksheet.columns.forEach((column: any) => {
    if (column.values) {
      const lengths = column.values.map((v: any) => {
        let length;
        if (v && typeof v === 'object' && 'text' in v) {
          length = v.text?.toString()?.length || 0;
        } else {
          length = v?.toString()?.length || 0;
        }
        return length;
      });
      column.width = Math.max(
        ...lengths.filter((v: any) => typeof v === 'number'),
      );
    }
  });
};

const currencyFormat = (currency: string, positiveColor: boolean = false) =>
  `${positiveColor ? '[Blue]' : ''}"${currency} "#,##0.00;[Red]\("${currency} "#,##0.00\)`;

const diff = (major: number, minor: number): number => major - minor;
