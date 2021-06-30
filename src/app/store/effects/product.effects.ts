import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsProduct from '../product.actions';
import { TranslateService } from '@ngx-translate/core';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';

@Injectable()
export class ProductEffects {

  @Effect()
  getAll$ = this.actions$.pipe(ofType(fromActionsProduct.ProductActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.productService.getAll(payload.active, payload.direction, payload.page,
      payload.size).pipe(
      switchMap((response: any) => of(new fromActionsProduct.ProductSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsProduct.ProductFailure({error: err.error})))
    ))
  );

  @Effect()
  findOne$ = this.actions$.pipe(ofType(fromActionsProduct.ProductActionTypes.productFind)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.productService.getById(payload).pipe(
      switchMap((product: any) => of(new fromActionsProduct.ProductSelected(product))),
      catchError((err: HttpErrorResponse) => of(new fromActionsProduct.ProductFailure({error: err.error})))
    ))
  );

  @Effect()
  save$ = this.actions$.pipe(ofType(fromActionsProduct.ProductActionTypes.productSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.productService.add(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('PRODUCT.ADD.CREATED', {name: response.name});
        return of(new fromActionsProduct.ProductSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsProduct.ProductFailure({error: err.error})))
    ))
  );

  @Effect()
  update = this.actions$.pipe(ofType(fromActionsProduct.ProductActionTypes.productUpdate)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.productService.update(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('PRODUCT.UPDATED.MESSAGE', {name: response.name});
        return of(new fromActionsProduct.ProductSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsProduct.ProductFailure({error: err.error})))
    ))
  );

  @Effect()
  delete$ = this.actions$.pipe(ofType(fromActionsProduct.ProductActionTypes.productDelete)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.productService.delete(payload).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('PRODUCT.DELETED.MESSAGE', {name: response.name});
        return of(new fromActionsProduct.ProductSaveSuccess({message}));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsProduct.ProductFailure({error: err.error})))
    ))
  );

  @Effect({dispatch: false})
  selectedData$ = this.actions$.pipe(
    ofType(fromActionsProduct.ProductActionTypes.productSelected),
    tap((data: any) => this.router.navigate(['product', data.payload.id]))
  );

  @Effect({dispatch: false})
  dataSuccess$ = this.actions$.pipe(
    ofType(fromActionsProduct.ProductActionTypes.productSuccess)
  );

  @Effect({dispatch: false})
  saveSuccess$ = this.actions$.pipe(
    ofType(fromActionsProduct.ProductActionTypes.productSaveSuccess)
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private productService: ProductService,
              private router: Router) {
  }
}
