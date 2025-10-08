import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';
import {
  GetOfficeToInvoice,
  InvoiceActionTypes,
  InvoiceFailure,
  InvoiceSuccess,
  OfficesSuccess,
  UpdateOfficeById,
  UpdateOfficesSuccess,
} from '../invoice.actions';
import { InvoiceService } from '../../services/invoice.service';
import { OfficeService } from '../../services/office.service';
import { IInvoice } from '../../interfaces/invoice';
import { IOffice } from '../../interfaces/office';

@Injectable()
export class InvoiceEffects {

  findInvoiceReservation$ = createEffect(() => this.actions.pipe(
    ofType(InvoiceActionTypes.getOfficeToInvoice),
    switchMap((action: GetOfficeToInvoice) =>
      this.invoiceService.getOfficeToInvoice(action.officeId, action.start, action.end, action.types).pipe(
        switchMap((response: IInvoice[]) => of(new InvoiceSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new InvoiceFailure(err.error))),
      )),
  ));

  findMyOffices$ = createEffect(() => this.actions.pipe(
    ofType(InvoiceActionTypes.getAllMyOffices),
    switchMap(() =>
      this.invoiceService.getAllMyOffices().pipe(
        switchMap((response: IOffice[]) => of(new OfficesSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new InvoiceFailure(err.error))),
      )),
  ));

  updateOffices$ = createEffect(() => this.actions.pipe(
    ofType(InvoiceActionTypes.updateOfficeById),
    switchMap((action: UpdateOfficeById) =>
      this.officeService.updateOffice(action.id, action.office).pipe(
        switchMap(() => of(new UpdateOfficesSuccess())),
        catchError((err: HttpErrorResponse) => of(new InvoiceFailure(err.error))),
      )),
  ));

  officesSuccess$ = createEffect(() => this.actions.pipe(
    ofType(InvoiceActionTypes.invoiceOfficesSuccess),
  ), { dispatch: false });

  updateOfficesSuccess$ = createEffect(() => this.actions.pipe(
    ofType(InvoiceActionTypes.invoiceUpdateOfficeSuccess),
  ), { dispatch: false });

  constructor(private actions: Actions, private invoiceService: InvoiceService, private officeService: OfficeService) {
  }
}
