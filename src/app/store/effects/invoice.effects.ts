import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import {
  getAllMyOffices,
  getInvoicesPage,
  getOfficeToInvoice,
  invoiceFailure,
  invoiceOfficesSuccess, invoicePageSuccess,
  invoiceSaveSuccess,
  invoiceSuccess,
  invoiceUpdateOfficeSuccess, invoiceView,
  updateOfficeById,
  uploadInvoices,
} from '../invoice.actions';
import { InvoiceService } from '../../services/invoice.service';
import { OfficeService } from '../../services/office.service';
import { IInvoice, IInvoiceData } from '../../interfaces/invoice';
import { IOfficeAll } from '../../interfaces/office';
import { TranslateService } from '@ngx-translate/core';
import { Pagination } from '../../interfaces/pagination';

@Injectable()
export class InvoiceEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly invoiceService: InvoiceService = inject(InvoiceService);
  private readonly officeService: OfficeService = inject(OfficeService);
  private readonly translateService: TranslateService = inject(TranslateService);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getInvoicesPage),
    switchMap(({ officeId, page, sort, direction, size }) =>
      this.invoiceService.getInvoicesPage(officeId, page, sort, direction, size).pipe(
        map((page: Pagination<IInvoiceData>) => invoicePageSuccess({ page })),
        catchError((err: HttpErrorResponse) => of(invoiceFailure({ error: err.error }))),
      )),
  ));

  invoiceView$ = createEffect(() => this.actions.pipe(
    ofType(invoiceView),
    switchMap(({ id, fileName, driveToken }) =>
      this.invoiceService.view(id, driveToken).pipe(
        map((blob: Blob) => invoiceSaveSuccess({ blob, fileName })),
        catchError((err: HttpErrorResponse) => of(invoiceFailure({ error: err.error }))),
      )),
  ));

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
        map((offices: IOfficeAll[]) => invoiceOfficesSuccess(offices ? { offices } : { offices: [] })),
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

  uploadInvoices$ = createEffect(() => this.actions.pipe(
    ofType(uploadInvoices),
    switchMap(({ officeId, blob, fileName, driveToken }) =>
      this.invoiceService.uploadInvoices(officeId, blob, fileName, driveToken).pipe(
        map(() => {
          const message = this.translateService.instant('INVOICE.UPLOAD_SUCCESS', { fileName });
          return invoiceSaveSuccess({ message, blob, fileName });
        }),
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
