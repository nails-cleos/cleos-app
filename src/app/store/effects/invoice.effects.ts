import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import {
  getInvoicesPage,
  getOfficeToInvoice,
  invoiceFailure,
  invoicePageSuccess,
  invoiceSaveSuccess,
  invoiceSuccess,
  invoiceUpdateOfficeSuccess,
  updateOfficeById,
  uploadInvoices,
} from '../actions/invoice.actions';
import { InvoiceService } from '../../services/invoice.service';
import { OfficeService } from '../../services/office.service';
import { IInvoice, IInvoiceData } from '../../interfaces/invoice';
import { TranslateService } from '@ngx-translate/core';
import { Pagination } from '../../interfaces/pagination';
import { effectRequest } from '../../util/rxjs';

@Injectable()
export class InvoiceEffects {
  private readonly actions: Actions = inject(Actions);
  private readonly invoiceService: InvoiceService = inject(InvoiceService);
  private readonly officeService: OfficeService = inject(OfficeService);
  private readonly translateService: TranslateService = inject(TranslateService);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getInvoicesPage),
    switchMap(({ officeId, page, sort, direction, size }) => effectRequest(
      this.invoiceService.getInvoicesPage(officeId, page, sort, direction, size)
        .pipe(map((page: Pagination<IInvoiceData>) => invoicePageSuccess({ page }))),
      action => action,
      invoiceFailure,
    )),
  ));

  findInvoiceReservation$ = createEffect(() => this.actions.pipe(
    ofType(getOfficeToInvoice),
    switchMap(({ officeId, start, end, types }) => effectRequest(
      this.invoiceService.getOfficeToInvoice(officeId, start, end, types)
        .pipe(map((data: IInvoice[]) => invoiceSuccess(data ? { data } : { data: [] }))),
      action => action,
      invoiceFailure,
    )),
  ));

  updateOffices$ = createEffect(() => this.actions.pipe(
    ofType(updateOfficeById),
    switchMap(({ id, office }) => effectRequest(
      this.officeService.updateOffice(id, office).pipe(map(() => invoiceUpdateOfficeSuccess())),
      action => action,
      invoiceFailure,
    )),
  ));

  uploadInvoices$ = createEffect(() =>
    this.actions.pipe(
      ofType(uploadInvoices),
      switchMap(({ officeId, blob, fileName, upload }) => {
        const message = this.translateService.instant('INVOICE.UPLOAD_SUCCESS', { fileName });

        if (!upload) {
          return of(invoiceSaveSuccess({ message, blob, fileName }));
        }
        return this.invoiceService.uploadInvoices(officeId, blob, fileName)
          .pipe(
            map(() => invoiceSaveSuccess({ message, blob, fileName })),
          );
      }),
    ));
}
