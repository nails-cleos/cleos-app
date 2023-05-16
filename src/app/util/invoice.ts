import { IRoomAll } from '../interfaces/room';
import { IUserAll } from '../interfaces/user';
import { currencySymbol, getUserName } from './helper';
import { IInvoice, IItem, ITotals } from '../interfaces/invoice';
import { API_LOCALE, dayViewTitle, invoiceTitle, newDateTimestamp } from './dates';
import { environment } from '../../environments/environment';
import { IOfficeAll } from '../interfaces/office';

const createField = (text: string, width: string | number, alignment: string, color?: string, margin: number[] = [0, 0, 0, 0],
                     border: boolean[] = [false, false, false, false], fontSize: number = 12, fillColor: string = '#fff'): any => {
  if (color) {
    return { text, color, width, alignment, fontSize, margin, border, fillColor };
  }

  return { text, width, alignment, fontSize, margin, border, fillColor };
};

const createHeader = (index: number, date: string, subject: string = '', kvKNr: string = '', accountNr: string = '',
                      btwNr: string = ''): any => {
  const image = {
    image: 'logo',
    width: '*',
    fit: [100, 100],
    alignment: 'center',
    pageBreak: 'none'
  };

  const data = {
    pageBreak: 'none',
    stack: [
      {
        columns: [
          createField('Date', 80, 'left', '#aaaaab'), // TODO
          createField(date, '*', 'left', '#333333')
        ]
      }, {
        columns: [
          createField('Subject', 80, 'left', '#aaaaab'), // TODO
          createField(subject, '*', 'left', '#333333')
        ]
      }, {
        columns: [
          createField('KvK nr', 80, 'left', '#aaaaab'), // TODO
          createField(kvKNr, '*', 'left', '#333333')
        ]
      }, {
        columns: [
          createField('Account nr', 80, 'left', '#aaaaab'), // TODO
          createField(accountNr, '*', 'left', '#333333')
        ]
      }, {
        columns: [
          createField('BTW nr', 80, 'left', '#aaaaab'), // TODO
          createField(btwNr, '*', 'left', '#333333')
        ]
      }
    ]
  };

  if (index > 0) {
    image.pageBreak = 'before';
    data.pageBreak = 'before';
  }

  return {
    columns: [[data], image]
  };
};

const fromTo = (): any => ({
  columns: [
    createField('', '*', 'left', undefined, [0, 20, 0, 5]),
    createField('', '*', 'right', undefined, [0, 20, 0, 5])
  ]
});

const companyName = (room: IRoomAll): any => {
  const phone = room.office.manager?.phone || '';
  const email = room.office.manager?.email || '';
  return [{
    columns: [
      createField('Address', 80, 'left', '#333333', [0, 0, 0, 5]), // TODO
      createField(room.address.name, 'auto', 'right', '#333333', [0, 0, 0, 0])
    ]
  }, {
    columns: [
      createField('Phone', 80, 'left', '#333333', [0, 0, 0, 5]), // TODO
      createField(phone, 'auto', 'right', '#333333', [0, 0, 0, 0])
    ]
  }, {
    columns: [
      createField('Email', 80, 'left', '#333333', [0, 0, 0, 5]), // TODO
      createField(email, 'auto', 'right', '#333333', [0, 0, 0, 0])
    ]
  }];
};

const clientName = (customer: IUserAll): any => {
  const client = getUserName(customer);
  const contact = customer.phone || customer.email;
  return [{
    columns: [
      createField('Client', 80, 'left', '#333333'), // TODO
      createField(client, '*', 'left', '#333333')
    ]
  }, {
    columns: [
      createField('Contact', 80, 'left', '#333333'), // TODO
      createField(contact, '*', 'left', '#333333')
    ]
  }];
};

const createInvoiceNro = (receiptNro: string): any => {
  const text = `Invoice No. ${ receiptNro }`; // TODO
  return createField(text, 'auto', 'center', undefined, [0, 10, 0, 10], undefined, 15);
};

const createItemTitle = (): any => [
  createField('ITEM DESCRIPTION', '*', 'center', undefined, // TODO
    [0, 12, 0, 5], [false, true, false, true], undefined, '#a9a397'),
  createField('ITEM \n (excl. btw)', '*', 'center', undefined, // TODO
    [0, 5, 0, 5], [false, true, false, true], undefined, '#a9a397'),
  createField('BTW', '*', 'center', undefined, // TODO
    [0, 12, 0, 5], [false, true, false, true], undefined, '#a9a397'),
  createField('ITEM TOTAL (incl. btw)', '*', 'center', undefined, // TODO
    [0, 5, 0, 5], [false, true, false, true], undefined, '#a9a397')
];

const itemBody = (name: string, neto: number, bruto: number, symbol: string): any => [
  createField(name, '*', 'left', undefined, [0, 5, 0, 5], [false, false, false, true]),
  createField(`${ symbol } ${ neto.toFixed(2) }`, '*', 'right', undefined,
    [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1'),
  createField(`${ symbol } ${ (bruto - neto).toFixed(2) }`, '*', 'right', undefined,
    [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1'),
  createField(`${ symbol } ${ bruto.toFixed(2) }`, '*', 'right', undefined,
    [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1')
];

const createItems = (itemTitle: any, itemList: IItem[], currency: string): any => {
  let body = [itemTitle];
  itemList.forEach(item => {
    const add = itemBody(item.name, item.netoPrice, item.brutoPrice, currency);
    body = [...body, add];
  });
  return {
    layout: {
      defaultBorder: false,
      hLineWidth: (i: number) => i === 1 || i === 0 ? 2 : 1,
      vLineWidth: () => 0,
      hLineColor: (i: number) => i === 1 || i === 0 ? '#8f887a' : '#dcc8c2',
      vLineColor: () => '#8f887a',
      hLineStyle: () => null,
      // vLineStyle: function (i, node) { return {dash: { length: 10, space: 4 }}; },
      paddingLeft: () => 10,
      paddingRight: () => 10,
      paddingTop: () => 2,
      paddingBottom: () => 2,
      fillColor: () => '#fff',
    },
    table: {
      headerRows: 1,
      widths: ['*', 80, 45, 80],
      body
    }
  };
};

const createTotals = (totals: ITotals, currency: string): any => {
  const subTotal = [
    createField('Subtotal:', '*', 'right', undefined, [0, 5, 0, 5], [false, true, false, true]), // TODO
    createField(`${ currency } ${ totals.subTotal.toFixed(2) }`, '*', 'right', undefined,
      [0, 5, 0, 5], [false, true, false, true], undefined, '#eee4e1')
  ];

  const excBTW = [
    createField('Excl. BTW:', '*', 'right', undefined, [0, 5, 0, 5], [false, false, false, true]), // TODO
    createField(`${ currency } ${ totals.excBTW.toFixed(2) }`, '*', 'right', undefined,
      [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1')
  ];

  const btw = [
    createField('BTW (21%):', '*', 'right', undefined, [0, 5, 0, 5], [false, false, false, true]), // TODO
    createField(`${ currency } ${ totals.btw.toFixed(2) }`, '*', 'right', undefined,
      [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1')
  ];

  const total = [
    createField('Total:', '*', 'right', undefined, [0, 5, 0, 5], [false, false, false, true], 20), // TODO
    createField(`${ currency } ${ totals.totalPaid.toFixed(2) }`, '*', 'right', undefined,
      [0, 5, 0, 5], [false, false, false, true], 20, '#eee4e1')
  ];

  let body = [total, btw, excBTW];

  if (totals.discount) {
    const discount = [
      createField('Discount:', '*', 'right', undefined, [0, 5, 0, 5], [false, false, false, true]), // TODO
      createField(`(${ currency } ${ totals.discount.toFixed(2) })`, '*', 'right', '#ff8080',
        [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1')];
    body = [subTotal, discount, total, btw, excBTW];
  }

  return {
    layout: {
      defaultBorder: false,
      hLineWidth: (i: number) => i === 0 ? 2 : 1,
      vLineWidth: () => 0,
      hLineColor: () => '#dcc8c2',
      vLineColor: () => '#dcc8c2',
      hLineStyle: () => null,
      paddingLeft: () => 10,
      paddingRight: () => 10,
      paddingTop: () => 3,
      paddingBottom: () => 3,
      fillColor: () => '#fff',
    },
    table: {
      headerRows: 1,
      widths: ['*', 80],
      body
    }
  };
};

export const pdf = (invoices: IInvoice[], office: IOfficeAll, start: number, startDate: Date, endDate: Date): any => {
  let content: any[] = [];
  invoices.map((invoice, index) => {
    const next = start + index;
    const receiptNro = `${ next }`.padStart(5, '0');
    const date = dayViewTitle(newDateTimestamp(invoice.timestamp, invoice.room.timeZone), API_LOCALE);
    const header = createHeader(index, date, office.subject, office.kvk, office.account, office.btw);
    const currency = currencySymbol(invoice.room.currency);
    const itemTitle = createItemTitle();

    const invoiceNro = createInvoiceNro(receiptNro);
    const items = createItems(itemTitle, invoice.items.slice().sort((a, b) => a.order - b.order), currency);
    const totals = createTotals(invoice.totals, currency);

    content = [...content, header, fromTo(), {
      columns: [clientName(invoice.customer), companyName(invoice.room)]
    }, '\n\n', invoiceNro, items, totals];
  });

  return {
    info: {
      fileName: `${ invoiceTitle(startDate) } - ${ invoiceTitle(endDate) }`,
      title: `${ invoiceTitle(startDate) } - ${ invoiceTitle(endDate) }`,
      author: getUserName(office.manager),
      subject: office.subject
    },
    content,
    defaultStyle: {
      font: 'belleza'
    },
    images: {
      logo: `${ environment.appServer }/assets/icons/icon-192x192.png`
    },
    pageSize: 'A4'
  };
};
