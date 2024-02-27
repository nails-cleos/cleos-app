import { CellFormulaValue, CellHyperlinkValue, Workbook, Worksheet } from 'exceljs';
import { API_LOCALE, createNewDateZonedTime, exportFormatDate, getCurrentTimeZone, monthViewTitle, newDateTimestamp } from './dates';
import { IMonthlyExport, IMonthlySummaryExpense, IMonthlySummarySale } from '../interfaces/dashboard';

export const createWorkbook = (data: IMonthlyExport[], date: Date, currency: string, timeZone: string = getCurrentTimeZone()): Workbook => {
  const workbook = new Workbook();

  data.forEach(it => {
    const name = monthViewTitle(new Date(date.getFullYear(), it.month - 1));
    const worksheet = workbook.addWorksheet(name);

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

    setTotal(worksheet, cellNumber, 'E', `E${ saleCellNumber } - E${ expenseCellNumber }`, saleGross - expenseGross);
    setTotal(worksheet, cellNumber, 'F', `F${ saleCellNumber } - F${ expenseCellNumber }`, saleNet - expenseNet);
    setTotal(worksheet, cellNumber, 'G', `G${ saleCellNumber } - G${ expenseCellNumber }`, saleBtw - expenseBtw);

    worksheet.getColumn('E').numFmt = `"${ currency }"#,##0.00;[Red]\-"${ currency }"#,##0.00`;
    worksheet.getColumn('F').numFmt = `"${ currency }"#,##0.00;[Red]\-"${ currency }"#,##0.00`;
    worksheet.getColumn('G').numFmt = `"${ currency }"#,##0.00;[Red]\-"${ currency }"#,##0.00`;

    worksheet.getCell(`E${cellNumber}`).numFmt = `[Green]"${ currency }"#,##0.00;[Red]\-"${ currency }"#,##0.00`;
    worksheet.getCell(`F${cellNumber}`).numFmt = `[Green]"${ currency }"#,##0.00;[Red]\-"${ currency }"#,##0.00`;
    worksheet.getCell(`G${cellNumber}`).numFmt = `[Green]"${ currency }"#,##0.00;[Red]\-"${ currency }"#,##0.00`;

    worksheet.columns.forEach(column => {
      if (column.values) {
        const lengths = column.values.map(v => v?.toString()?.length || 0);
        column.width = Math.max(...lengths.filter(v => typeof v === 'number'));
      }
    });
  });

  return workbook;
};

const cells = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

const addData = (worksheet: Worksheet, key: string, cellNumber: number, column3Name: string, column4Name: string,
                 rowData: (CellHyperlinkValue | string | number)[][], gross: number, net: number, btw: number): number => {
  worksheet.mergeCells(`A${ cellNumber }`, `G${ cellNumber }`);
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

  // Add Header Rows
  worksheet.addRow(['N°', 'Date', column3Name, column4Name, 'Gross', 'Net', 'BTW']);
  cellNumber++;
  cells.forEach((cell, index) => {
    const currentCell = worksheet.getCell(`${ cell }${ cellNumber }`);
    currentCell.alignment = { vertical: 'middle', horizontal: 'center' };
    currentCell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'dcc8c2' }
    };
    currentCell.border = {
      left: { style: index === 0 ? 'medium' : 'thin' },
      right: { style: index === cells.length - 1 ? 'medium' : 'thin' },
      top: { style: 'thin' },
      bottom: { style: 'thin' }
    };
  });

  const init = ++cellNumber;
  if (rowData.length) {
    worksheet.addRows(rowData);
    cellNumber += rowData.length;
    setBorder(worksheet, init, cellNumber - 1);

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

    gross += sale.total.gross;
    net += sale.total.net;
    btw += sale.total.btw;

    return [index + 1, exportFormatDate(newDateTimestamp(sale.timestamp, timeZone), API_LOCALE, timeZone),
      sale.customerName, sale.description, sale.total.gross, sale.total.net, sale.total.btw];
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

const setTotal = (worksheet: Worksheet, cellNumber: number, letter: 'E' | 'F' | 'G', formula: string, result: number): void => {
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

const setBorder = (worksheet: Worksheet, start: number, end: number) => {
  cells.forEach((cell, index) => {
    const length = Math.abs(end - start) + 1;
    Array.from({ length }, (_, i) => start + i).forEach(cellNumber => {
      const currentCell = worksheet.getCell(`${ cell }${ cellNumber }`);
      currentCell.border = {
        left: { style: index === 0 ? 'medium' : 'thin' },
        right: { style: index === cells.length - 1 ? 'medium' : 'thin' },
      };
    });
  });
};

