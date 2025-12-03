import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IInvoice } from '../../interfaces/invoice';
import { INVOICE_FEATURE_KEY, InvoiceState } from '../reducers/invoice.reducers';
import { IOfficeAll } from '../../interfaces/office';

const selectInvoiceState = createFeatureSelector<InvoiceState>(INVOICE_FEATURE_KEY);

const selectInvoices = createSelector(
  selectInvoiceState,
  (state: InvoiceState) => state?.data,
);
export const getInvoicesPipe = pipe(
  select(selectInvoices),
  filter((val): val is IInvoice[] => val !== undefined),
);

const selectOffices = createSelector(
  selectInvoiceState,
  (state: InvoiceState) => state?.offices,
);
export const getOfficesPipe = pipe(
  select(selectOffices),
  filter((val): val is IOfficeAll[] => val !== undefined),
);

