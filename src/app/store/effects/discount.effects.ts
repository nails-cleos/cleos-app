import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsDiscount from '../discount.actions';
import { TranslateService } from '@ngx-translate/core';
import { DiscountService } from '../../services/discount.service';
import { Router } from '@angular/router';

@Injectable()
export class DiscountEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.discountService.getAll(payload.active, payload.direction, payload.page, 'pages',
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsDiscount.DiscountSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({error: err.error})))
    ))
  );

  @Effect()
  getMyDiscounts$ = this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.getMyDiscounts)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.discountService.getAll(payload.active, payload.direction, payload.page, 'me',
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsDiscount.DiscountSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({error: err.error})))
    ))
  );

  @Effect()
  getMyReferrals$ = this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.getReferrals)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.discountService.getReferrals().pipe(
      switchMap((response: any) => of(new fromActionsDiscount.ReferralSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({error: err.error})))
    ))
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.discountFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.discountService.getById(payload).pipe(
      switchMap((discount: any) => of(new fromActionsDiscount.DiscountSelected(discount))),
      catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({error: err.error})))
    ))
  );

  @Effect()
  addDiscount$ = this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.addDiscount)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.discountService.send(payload.discountId, payload.customerIds).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('DISCOUNT.SEND', {name: response.name});
        return of(new fromActionsDiscount.DiscountSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({error: err.error})))
    ))
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.discountSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.discountService.add(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('DISCOUNT.CREATED', {name: response.name});
        return of(new fromActionsDiscount.DiscountSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({error: err.error})))
    ))
  );

  @Effect()
  update = this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.discountUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.discountService.update(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('DISCOUNT.UPDATED.MESSAGE', {name: response.name});
        return of(new fromActionsDiscount.DiscountSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({error: err.error})))
    ))
  );

  @Effect()
  delete$ = this.actions$.pipe(ofType(fromActionsDiscount.DiscountActionTypes.discountDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.discountService.delete(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('DISCOUNT.DELETED.MESSAGE', {name: response.name});
        return of(new fromActionsDiscount.DiscountSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsDiscount.DiscountFailure({error: err.error})))
    ))
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(fromActionsDiscount.DiscountActionTypes.discountSelected),
    tap((data: any) => this.router.navigate(['discounts', data.payload.id]))
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(fromActionsDiscount.DiscountActionTypes.discountSuccess)
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(fromActionsDiscount.DiscountActionTypes.discountSaveSuccess)
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private discountService: DiscountService,
              private router: Router) {
  }
}
