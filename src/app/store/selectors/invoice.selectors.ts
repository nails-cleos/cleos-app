import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IInvoice, IInvoiceData } from '../../interfaces/invoice';
import { INVOICE_FEATURE_KEY, InvoiceState } from '../reducers/invoice.reducers';
import { IOfficeAll } from '../../interfaces/office';
import { Pagination } from '../../interfaces/pagination';
import { IResponseSuccess } from '../../interfaces/common';

const selectInvoiceState = createFeatureSelector<InvoiceState>(INVOICE_FEATURE_KEY);

const selectInvoices = createSelector(
  selectInvoiceState,
  (state: InvoiceState) => state?.data,
);
export const getInvoicesPipe = pipe(
  select(selectInvoices),
  filter((val): val is IInvoice[] => val !== undefined),
);

const selectInvoicesPage = createSelector(
  selectInvoiceState,
  (state: InvoiceState) => state?.page,
);
export const getInvoicesPagePipe = pipe(
  select(selectInvoicesPage),
  filter((val): val is Pagination<IInvoiceData> => val !== undefined),
);

const selectOffices = createSelector(
  selectInvoiceState,
  (state: InvoiceState) => state?.offices,
);
export const getOfficesPipe = pipe(
  select(selectOffices),
  filter((val): val is IOfficeAll[] => val !== undefined),
);

export const selectInvoiceIsLoading = createSelector(
  selectInvoiceState,
  (state: InvoiceState) => state?.isLoading,
);

export const selectInvoiceError = createSelector(
  selectInvoiceState,
  (state: InvoiceState) => state?.error,
);

export const selectInvoiceResponse = createSelector(
  selectInvoiceState,
  (state: InvoiceState) => state?.response,
);
export const getInvoiceResponsePipe = pipe(
  select(selectInvoiceResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);
