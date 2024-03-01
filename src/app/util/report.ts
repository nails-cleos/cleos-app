import { CellFormulaValue, CellHyperlinkValue, Workbook, Worksheet } from 'exceljs';
import { API_LOCALE, createNewDateZonedTime, exportFormatDate, getCurrentTimeZone, monthViewTitle, newDateTimestamp } from './dates';
import { IMonthlyExport, IMonthlySummaryExpense, IMonthlySummarySale, ISummaryTotal } from '../interfaces/dashboard';

interface IMonthResult {
  name: string;
  month: number;
  totalGross: number;
  totalNet: number;
  totalBtw: number;
  cellNumber: number;
}

export const createWorkbook = (data: IMonthlyExport[], date: Date, currency: string, timeZone: string = getCurrentTimeZone()): Workbook => {
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

const setTitle = (worksheet: Worksheet, cellNumber: number, endLetter: string, key: string) => {
  worksheet.mergeCells(`A${ cellNumber }`, `${ endLetter }${ cellNumber }`);
  const titleCell = worksheet.getCell(`A${ cellNumber }`);
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
const setTotal = (worksheet: Worksheet, cellNumber: number, letter: string, formula: string, result: number): void => {
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
    right: { style: letter === 'G' ? 'medium' : 'thin' }
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

const setBorder = (worksheet: Worksheet, start: number, end: number, cellList: string[]) => {
  cellList.forEach((cell, index) => {
    const length = Math.abs(end - start) + 1;
    Array.from({ length }, (_, i) => start + i).forEach(cellNumber => {
      const currentCell = worksheet.getCell(`${ cell }${ cellNumber }`);
      currentCell.border = {
        left: { style: index === 0 ? 'medium' : 'thin' },
        right: { style: index === cellList.length - 1 ? 'medium' : 'thin' },
      };
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
