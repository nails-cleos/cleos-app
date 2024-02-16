import { IUserAll } from '../interfaces/user';
import { currencySymbol } from './helper';
import { IInvoice, IItem, IRoomInvoice, ITotals } from '../interfaces/invoice';
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

const createHeader = (index: number, titleDate: string, date: string, titleSubject: string = '', subject: string = '',
                      titleKVK: string = '', kvkNr: string = '', titleAccount: string = '', accountNr: string = '',
                      titleBTW: string = '', btwNr: string = ''): any => {
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
          createField(titleDate, 80, 'left', '#aaaaab'),
          createField(date, '*', 'left', '#333333')
        ]
      }, {
        columns: [
          createField(titleSubject, 80, 'left', '#aaaaab'),
          createField(subject, '*', 'left', '#333333')
        ]
      }, {
        columns: [
          createField(titleKVK, 80, 'left', '#aaaaab'),
          createField(kvkNr, '*', 'left', '#333333')
        ]
      }, {
        columns: [
          createField(titleAccount, 80, 'left', '#aaaaab'),
          createField(accountNr, '*', 'left', '#333333')
        ]
      }, {
        columns: [
          createField(titleBTW, 80, 'left', '#aaaaab'),
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

const companyName = (room: IRoomInvoice, titleAddress: string, titlePhone: string, titleEmail: string,
                     billAddress?: string): any => {
  const phone = room.phone || '';
  const email = room.email || '';
  const address = billAddress || room.addressName;
  return [{
    columns: [
      createField(titleAddress, 80, 'left', '#333333', [0, 0, 0, 5]),
      createField(address, 'auto', 'right', '#333333', [0, 0, 0, 0])
    ]
  }, {
    columns: [
      createField(titlePhone, 80, 'left', '#333333', [0, 0, 0, 5]),
      createField(phone, 'auto', 'right', '#333333', [0, 0, 0, 0])
    ]
  }, {
    columns: [
      createField(titleEmail, 80, 'left', '#333333', [0, 0, 0, 5]),
      createField(email, 'auto', 'right', '#333333', [0, 0, 0, 0])
    ]
  }];
};

const clientName = (customer: IUserAll, titleClient: string, titleContact: string): any => {
  const client = customer.displayName;
  const contact = customer.phone || customer.email;
  return [{
    columns: [
      createField(titleClient, 80, 'left', '#333333'),
      createField(client, '*', 'left', '#333333')
    ]
  }, {
    columns: [
      createField(titleContact, 80, 'left', '#333333'),
      createField(contact, '*', 'left', '#333333')
    ]
  }];
};

const createInvoiceNro = (receiptNro: string): any => createField(receiptNro, 'auto', 'center', undefined,
  [0, 10, 0, 10], undefined, 15);

const createItemTitle = (titleDescription: string, titleItem: string, titleBTW: string, titleTotal: string): any => [
  createField(titleDescription, '*', 'center', undefined, [0, 12, 0, 5], [false, true, false, true],
    undefined, '#a9a397'),
  createField(titleItem, '*', 'center', undefined, [0, 5, 0, 5], [false, true, false, true],
    undefined, '#a9a397'),
  createField(titleBTW, '*', 'center', undefined, [0, 12, 0, 5], [false, true, false, true],
    undefined, '#a9a397'),
  createField(titleTotal, '*', 'center', undefined, [0, 5, 0, 5], [false, true, false, true],
    undefined, '#a9a397')
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

const createTotals = (totals: ITotals, currency: string, titleSubTotal: string, titleExclBTW: string, titleBTW21: string,
                      titleTotal: string, titleDiscount: string): any => {
  const subTotal = [
    createField(titleSubTotal, '*', 'right', undefined, [0, 5, 0, 5], [false, true, false, true]),
    createField(`${ currency } ${ totals.subTotal.toFixed(2) }`, '*', 'right', undefined,
      [0, 5, 0, 5], [false, true, false, true], undefined, '#eee4e1')
  ];

  const excBTW = [
    createField(titleExclBTW, '*', 'right', undefined, [0, 5, 0, 5], [false, false, false, true]),
    createField(`${ currency } ${ totals.excBTW.toFixed(2) }`, '*', 'right', undefined,
      [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1')
  ];

  const btw = [
    createField(titleBTW21, '*', 'right', undefined, [0, 5, 0, 5], [false, false, false, true]),
    createField(`${ currency } ${ totals.btw.toFixed(2) }`, '*', 'right', undefined,
      [0, 5, 0, 5], [false, false, false, true], undefined, '#eee4e1')
  ];

  const total = [
    createField(titleTotal, '*', 'right', undefined, [0, 5, 0, 5], [false, false, false, true], 20),
    createField(`${ currency } ${ totals.totalPaid.toFixed(2) }`, '*', 'right', undefined,
      [0, 5, 0, 5], [false, false, false, true], 20, '#eee4e1')
  ];

  let body = [total, btw, excBTW];

  if (totals.discount) {
    const discount = [
      createField(titleDiscount, '*', 'right', undefined, [0, 5, 0, 5], [false, false, false, true]),
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
    const next = start + invoice.position;
    const receiptNro = `${ next }`.padStart(5, '0');
    const date = dayViewTitle(newDateTimestamp(invoice.timestamp, invoice.room.timeZone), API_LOCALE);
    const titleDate = 'Date';
    const titleSubject = 'Subject';
    const titleKVK = 'KvK nr';
    const titleAccount = 'Account nr';
    const titleBTWNr = 'BTW nr';
    const header = createHeader(index, titleDate, date, titleSubject, office.subject, titleKVK, office.kvk, titleAccount, office.account,
      titleBTWNr, office.btw);
    const currency = currencySymbol(invoice.room.currencyCode);

    const titleDescription = 'ITEM DESCRIPTION';
    const titleItem = 'ITEM \n (excl. btw)';
    const titleBTW = 'BTW';
    const titleItemTotal = 'ITEM TOTAL \n (incl. btw)';

    const itemTitle = createItemTitle(titleDescription, titleItem, titleBTW, titleItemTotal);

    const text = `Invoice No. ${ receiptNro }`;
    const invoiceNro = createInvoiceNro(text);
    const items = createItems(itemTitle, invoice.items.slice().sort((a, b) => a.order - b.order), currency);

    const titleSubTotal = 'Subtotal:';
    const titleExclBTW = 'Excl. BTW:';
    const titleBTW21 = 'BTW (21%):';
    const titleTotal = 'Total:';
    const titleDiscount = 'Discount:';

    const totals = createTotals(invoice.totals, currency, titleSubTotal, titleExclBTW, titleBTW21, titleTotal, titleDiscount);

    const titleAddress = 'Address';
    const titlePhone = 'Phone';
    const titleEmail = 'Email';
    const titleClient = 'Client';
    const titleContact = 'Contact';

    content = [...content, header, fromTo(), {
      columns: [clientName(invoice.customer, titleClient, titleContact),
        companyName(invoice.room, titleAddress, titlePhone, titleEmail, office.billingAddress)]
    }, '\n\n', invoiceNro, items, totals];
  });

  return {
    info: {
      fileName: `${ invoiceTitle(startDate) } - ${ invoiceTitle(endDate) }`,
      title: `${ invoiceTitle(startDate) } - ${ invoiceTitle(endDate) }`,
      author: office.manager.displayName,
      subject: office.subject
    },
    content,
    images: {
      logo: `${ environment.appServer }/assets/icons/icon-192x192.png`
    },
    pageSize: 'A4'
  };
};
