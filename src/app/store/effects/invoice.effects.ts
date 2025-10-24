import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  getAllMyOffices,
  getOfficeToInvoice,
  invoiceFailure,
  invoiceOfficesSuccess,
  invoiceSuccess,
  invoiceUpdateOfficeSuccess,
  updateOfficeById,
} from '../invoice.actions';
import { InvoiceService } from '../../services/invoice.service';
import { OfficeService } from '../../services/office.service';
import { IInvoice } from '../../interfaces/invoice';
import { IOffice } from '../../interfaces/office';

@Injectable()
export class InvoiceEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly invoiceService: InvoiceService = inject(InvoiceService);
  private readonly officeService: OfficeService = inject(OfficeService);

  findInvoiceReservation$ = createEffect(() => this.actions.pipe(
    ofType(getOfficeToInvoice),
    switchMap(({ officeId, start, end, types }) =>
      this.invoiceService.getOfficeToInvoice(officeId, start, end, types).pipe(
        map((data: IInvoice[]) => invoiceSuccess(data ? { data } : { data: [] })),
        catchError((err: HttpErrorResponse) => of(invoiceFailure({ error: err.error }))),
      )),
  ));

  findMyOffices$ = createEffect(() => this.actions.pipe(
    ofType(getAllMyOffices),
    switchMap(() =>
      this.invoiceService.getAllMyOffices().pipe(
        map((offices: IOffice[]) => invoiceOfficesSuccess(offices ? { offices } : { offices: [] })),
        catchError((err: HttpErrorResponse) => of(invoiceFailure({ error: err.error }))),
      )),
  ));

  updateOffices$ = createEffect(() => this.actions.pipe(
    ofType(updateOfficeById),
    switchMap(({ id, office }) =>
      this.officeService.updateOffice(id, office).pipe(
        map(() => invoiceUpdateOfficeSuccess()),
        catchError((err: HttpErrorResponse) => of(invoiceFailure({ error: err.error }))),
      )),
  ));

  officesSuccess$ = createEffect(() => this.actions.pipe(
    ofType(invoiceOfficesSuccess),
  ), { dispatch: false });

  updateOfficesSuccess$ = createEffect(() => this.actions.pipe(
    ofType(invoiceUpdateOfficeSuccess),
  ), { dispatch: false });
}
