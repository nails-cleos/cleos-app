import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import { TranslateService } from '@ngx-translate/core';
import * as fromActionsInvoice from '../invoice.actions';
import { InvoiceService } from '../../services/invoice.service';
import { OfficeService } from '../../services/office.service';

@Injectable()
export class InvoiceEffects {

  findInvoiceReservation$ = createEffect(() =>
    this.actions.pipe(ofType(fromActionsInvoice.InvoiceActionTypes.findOfficeToInvoice)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) =>
        this.invoiceService.findOfficeToInvoice(payload.officeId, payload.start, payload.end, payload.types).pipe(
          switchMap((response) => of(new fromActionsInvoice.InvoiceSuccess(response ? response : []))),
          catchError((err: HttpErrorResponse) => of(new fromActionsInvoice.InvoiceFailure({ error: err.error }))),
        )),
    ));

  findMyOffices$ = createEffect(
    () => this.actions.pipe(ofType(fromActionsInvoice.InvoiceActionTypes.getAllMyOffices)).pipe(
      map((action: any) => action.payload),
      switchMap(() => this.invoiceService.getAllMyOffices().pipe(
        switchMap((response) => of(new fromActionsInvoice.OfficesSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new fromActionsInvoice.InvoiceFailure({ error: err.error }))),
      )),
    ));

  updateOffices$ = createEffect(
    () => this.actions.pipe(ofType(fromActionsInvoice.InvoiceActionTypes.updateOfficeById)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.officeService.updateOfficeById(payload).pipe(
        switchMap((response) => of(new fromActionsInvoice.UpdateOfficesSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsInvoice.InvoiceFailure({ error: err.error }))),
      )),
    ));

  officesSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsInvoice.InvoiceActionTypes.invoiceOfficesSuccess),
  ), { dispatch: false });

  updateOfficesSuccess$ = createEffect(() => this.actions.pipe(
    ofType(fromActionsInvoice.InvoiceActionTypes.invoiceUpdateOfficeSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions: Actions,
              private invoiceService: InvoiceService, private officeService: OfficeService) {
  }
}
