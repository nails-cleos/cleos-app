import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, Effect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap } from 'rxjs/operators';
import * as fromActionsMain from '../main.actions';
import { TranslateService } from '@ngx-translate/core';
import { CatalogueService } from '../../services/catalogue.service';
import { ProductService } from '../../services/product.service';
import { MainService } from '../../services/main.service';

@Injectable()
export class MainEffects {

  @Effect()
  getAllCatalogue$ = this.actions$.pipe(ofType(fromActionsMain.MainActionTypes.getAllCatalogue)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.catalogueService.getAll().pipe(
      switchMap((response: any) => of(new fromActionsMain.CatalogueSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsMain.RequestFailure({error: err.error})))
    ))
  );

  @Effect()
  getAllProducts$ = this.actions$.pipe(ofType(fromActionsMain.MainActionTypes.getAllProducts)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.productService.getProductList().pipe(
      switchMap((response: any) => of(new fromActionsMain.ProductsSuccess(response))),
      catchError((err: HttpErrorResponse) => of(new fromActionsMain.RequestFailure({error: err.error})))
    ))
  );

  @Effect()
  sendMessage$ = this.actions$.pipe(ofType(fromActionsMain.MainActionTypes.sendMessage)).pipe(
    map((action: any) => action.payload),
    switchMap((payload) => this.mainService.sendMessage(payload).pipe(
      switchMap(() => {
        const message = this.translate.instant('MAIN.CONTACT.SEND.MESSAGE');
        return of(new fromActionsMain.RequestSuccess({message}));
      }),
      catchError((err: HttpErrorResponse) => of(new fromActionsMain.RequestFailure({error: err.error})))
    ))
  );

  @Effect({dispatch: false})
  catalogueSuccess$ = this.actions$.pipe(
    ofType(fromActionsMain.MainActionTypes.catalogueSuccess)
  );

  @Effect({dispatch: false})
  productDataSuccess$ = this.actions$.pipe(
    ofType(fromActionsMain.MainActionTypes.productSuccess)
  );

  @Effect({dispatch: false})
  requestSuccess$ = this.actions$.pipe(
    ofType(fromActionsMain.MainActionTypes.requestSuccess)
  );

  constructor(private readonly translate: TranslateService, private actions$: Actions, private mainService: MainService,
              private catalogueService: CatalogueService, private productService: ProductService) {
  }
}
