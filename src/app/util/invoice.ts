import { IUserAll } from '../interfaces/user';
import { currencySymbol } from './helper';
import { IInvoice, IItem, IRoomInvoice, ITotals } from '../interfaces/invoice';
import { API_LOCALE, dayViewTitle, newDateTimestamp } from './dates';
import { environment } from '../../environments/environment';
import { IOfficeAll } from '../interfaces/office';

const createHeader = (index: number, titleDate: string, date: string, titleSubject: string = '', subject: string = '',
  titleKVK: string = '', kvkNr: string = '', titleAccount: string = '', accountNr: string = '',
  titleBTW: string = '', btwNr: string = ''): any => {
  const image = {
    image: 'logo',
    width: '*',
    fit: [180, 180],
    margin: [0, -40, 0, 0],
    alignment: 'right',
    pageBreak: 'none',
  };

  const data = {
    pageBreak: 'none',
    stack: [
      {
        columns: [
          { text: titleDate, style: 'header' },
          { text: date, style: 'field' },
        ],
      }, {
        columns: [
          { text: titleSubject, style: 'header' },
          { text: subject, style: 'field' },
        ],
      }, {
        columns: [
          { text: titleKVK, style: 'header' },
          { text: kvkNr, style: 'field' },
        ],
      }, {
        columns: [
          { text: titleAccount, style: 'header' },
          { text: accountNr, style: 'field' },
        ],
      }, {
        columns: [
          { text: titleBTW, style: 'header' },
          { text: btwNr, style: 'field' },
        ],
      },
    ],
  };

  if (index > 0) {
    image.pageBreak = 'before';
    data.pageBreak = 'before';
  }

  return {
    columns: [[data], image],
  };
};

const companyName = (room: IRoomInvoice, titleAddress: string, titlePhone: string, titleEmail: string,
  billAddress?: string): any => {
  const phone = room.phone || '';
  const email = room.email || '';
  const address = billAddress || room.addressName;
  return [{
    columns: [
      { text: titleAddress, style: 'header' },
      { text: address, style: ['field', 'fieldMargin'] },
    ],
  }, {
    columns: [
      { text: titlePhone, style: 'header' },
      { text: phone, style: ['field', 'fieldMargin'] },
    ],
  }, {
    columns: [
      { text: titleEmail, style: 'header' },
      { text: email, style: ['field', 'fieldMargin'] },
    ],
  }];
};

const clientName = (customer: IUserAll, titleClient: string, titleContact: string): any => {
  const client = customer.displayName;
  const contact = customer.phone || customer.email;
  return [{
    columns: [
      { text: titleClient, style: 'header' },
      { text: client, style: 'field' },
    ],
  }, {
    columns: [
      { text: titleContact, style: 'header' },
      { text: contact, style: 'field' },
    ],
  }];
};

const createInvoiceNro = (receiptNro: string): any => ({ text: receiptNro, style: 'invoiceNro' });

const createItemTitle = (titleDescription: string, titleItem: string, titleBTW: string, titleTotal: string): any => [
  { text: titleDescription, style: ['itemTitle', 'itemMargin'], border: [false, true, false, true] },
  { text: titleItem, style: ['itemTitle', 'item'], border: [false, true, false, true] },
  { text: titleBTW, style: ['itemTitle', 'itemMargin'], border: [false, true, false, true] },
  { text: titleTotal, style: ['itemTitle', 'item'], border: [false, true, false, true] },
];

const itemBody = (name: string, neto: number, bruto: number, symbol: string): any => [
  { text: name, style: 'item', border: [false, false, false, true] },
  {
    text: `${ symbol } ${ neto.toFixed(2) }`,
    style: ['item', 'amountKey', 'amount'],
    border: [false, false, false, true],
  },
  {
    text: `${ symbol } ${ (bruto - neto).toFixed(2) }`,
    style: ['item', 'amountKey', 'amount'],
    border: [false, false, false, true],
  },
  {
    text: `${ symbol } ${ bruto.toFixed(2) }`,
    style: ['item', 'amountKey', 'amount'],
    border: [false, false, false, true],
  },
];

const createItems = (itemTitle: any, itemList: IItem[], currency: string): any => {
  let body = [itemTitle];
  itemList.forEach(item => {
    const add = itemBody(item.name, item.netPrice, item.grossPrice, currency);
    body = [...body, add];
  });
  return {
    layout: {
      defaultBorder: false,
      hLineWidth: (i: number) => i === 1 || i === 0 ? 2 : 1,
      vLineWidth: () => 0,
      hLineColor: (i: number) => i === 1 || i === 0 ? '#9d9282' : '#dcc8c2',
      vLineColor: () => '#9d9282',
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
      body,
    },
  };
};

const createTotals = (totals: ITotals, currency: string, titleSubTotal: string, titleExclBTW: string,
  titleBTW21: string, titleTotal: string, titleDiscount: string): any => {
  const subTotal = [
    { text: titleSubTotal, style: ['item', 'amountKey'], border: [false, false, false, true] },
    {
      text: `${ currency } ${ totals.subTotal.toFixed(2) }`,
      style: ['item', 'amountKey', 'amount'],
      border: [false, false, false, true],
    },
  ];

  const excBTW = [
    { text: titleExclBTW, style: ['item', 'amountKey'], border: [false, false, false, true] },
    {
      text: `${ currency } ${ totals.excBTW.toFixed(2) }`,
      style: ['item', 'amountKey', 'amount'],
      border: [false, false, false, true],
    },
  ];

  const btw = [
    { text: titleBTW21, style: ['item', 'amountKey'], border: [false, false, false, true] },
    {
      text: `${ currency } ${ totals.btw.toFixed(2) }`,
      style: ['item', 'amountKey', 'amount'],
      border: [false, false, false, true],
    },
  ];

  const total = [
    { text: titleTotal, style: ['item', 'amountKey'], border: [false, true, false, true], fontSize: 20 },
    {
      text: `${ currency } ${ totals.totalPaid.toFixed(2) }`,
      style: ['item', 'amountKey', 'amount'],
      border: [false, true, false, true],
      fontSize: 20,
    },
  ];

  let body = [total, btw, excBTW];

  if (totals.discount) {
    const discount = [
      { text: titleDiscount, style: ['item', 'amountKey'], border: [false, false, false, true] },
      {
        text: `(${ currency } ${ totals.discount.toFixed(2) })`,
        style: ['item', 'amountKey', 'amount', 'discount'],
        border: [false, false, false, true],
      },
    ];
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
      body,
    },
  };
};

// TODO translate
export const pdf = (invoices: IInvoice[], office: IOfficeAll, start: number, fileName: string): any => {
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
    const header = createHeader(index, titleDate, date, titleSubject, office.subject, titleKVK, office.kvk,
      titleAccount, office.account, titleBTWNr, office.btw);
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

    const totals = createTotals(invoice.totals, currency, titleSubTotal, titleExclBTW, titleBTW21, titleTotal,
      titleDiscount);

    const titleAddress = 'Address';
    const titlePhone = 'Phone';
    const titleEmail = 'Email';
    const titleClient = 'Client';
    const titleContact = 'Contact';

    content = [...content, header, {
      columns: [clientName(invoice.customer, titleClient, titleContact),
        companyName(invoice.room, titleAddress, titlePhone, titleEmail, office.billingAddress)],
    }, '\n\n', invoiceNro, items, totals];
  });

  return {
    info: {
      fileName: fileName,
      title: fileName,
      author: office.manager.displayName,
      subject: office.subject,
    },
    content,
    styles: {
      header: {
        color: '#aaaaab',
        width: 80,
        bold: true,
      },
      field: {
        color: '#333333',
        width: 'auto',
      },
      fieldMargin: {
        margin: [-40, 0, 0, 0],
      },
      invoiceNro: {
        width: 'auto',
        alignment: 'center',
        fontSize: 15,
        margin: [0, 10, 0, 10],
      },
      itemTitle: {
        alignment: 'center',
        fillColor: '#b5ac9e',
      },
      itemMargin: {
        width: '*',
        margin: [0, 12, 0, 5],
      },
      item: {
        width: '*',
        margin: [0, 5, 0, 5],
      },
      amount: {
        fillColor: '#eee4e1',
      },
      discount: {
        color: '#d28d8c',
      },
      amountKey: {
        alignment: 'right',
      },
    },
    watermark: { text: 'Nails Cleos', color: '#000000', opacity: 0.1 },
    images: {
      logo: `${ environment.appServer }/assets/icons/icon-512x512.png`,
    },
    defaultStyle: {
      font: 'EBGaramond',
    },
    pageSize: 'A4',
  };
};
