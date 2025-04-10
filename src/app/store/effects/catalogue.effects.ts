import { HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import * as fromActionsCatalogue from '../catalogue.actions';
import { TranslateService } from '@ngx-translate/core';
import { CatalogueService } from '../../services/catalogue.service';
import { Router } from '@angular/router';
import { TreatmentService } from '../../services/treatment.service';

@Injectable()
export class CatalogueEffects {

  getAll$ = createEffect(() => this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.getAll)).pipe(
    map((action: any) => action.payload),
    switchMap(() => this.catalogueService.getAll().pipe(
      switchMap((response: any) => of(new fromActionsCatalogue.CatalogueSuccess(response ? response : []))),
      catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({ error: err.error }))),
    )),
  ));

  getAllCatalogs$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.getAllCatalogs)).pipe(
      map((action: any) => action.payload),
      switchMap(() => this.catalogueService.getAllCatalogs().pipe(
        switchMap((response: any) => of(new fromActionsCatalogue.CatalogueSuccess(response ? response : []))),
        catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({ error: err.error }))),
      )),
    ));

  findOne$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueFind)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.catalogueService.getById(payload).pipe(
        switchMap((catalogue: any) => of(new fromActionsCatalogue.CatalogueSelected(catalogue))),
        catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({ error: err.error }))),
      )),
    ));

  save$ = createEffect(() => this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueSave)).pipe(
    map((action: any) => action.payload),
    switchMap((payload: any) => this.catalogueService.add(payload.catalogue, payload.file).pipe(
      switchMap((response: any) => {
        const message = this.translate.instant('CATALOGUE.CREATED', { name: response.name });
        return of(new fromActionsCatalogue.CatalogueSaveSuccess({ message }));
      }), catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({ error: err.error }))),
    )),
  ));

  update$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueUpdate)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.catalogueService.update(payload.catalogue, payload.file).pipe(
        switchMap((response: any) => {
          const message = this.translate.instant('CATALOGUE.UPDATED.MESSAGE', { name: response.name });
          return of(new fromActionsCatalogue.CatalogueSaveSuccess({ message }));
        }), catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({ error: err.error }))),
      )),
    ));

  updateAll$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueUpdateAll)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.catalogueService.updateAll(payload).pipe(
        switchMap(() => {
          const message = this.translate.instant('CATALOGUE.UPDATED.ALL.MESSAGE');
          return of(new fromActionsCatalogue.CatalogueSaveSuccess({ message }));
        }), catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({ error: err.error }))),
      )),
    ));

  delete$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueDelete)).pipe(
      map((action: any) => action.payload),
      switchMap((payload: any) => this.catalogueService.delete(payload.id).pipe(
        switchMap(() => {
          const message = this.translate.instant('CATALOGUE.DELETED.MESSAGE', { name: payload.name });
          return of(new fromActionsCatalogue.CatalogueSaveSuccess({ message }));
        }), catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({ error: err.error }))),
      )),
    ));

  findGroups$ = createEffect(
    () => this.actions$.pipe(ofType(fromActionsCatalogue.CatalogueActionTypes.findGroups)).pipe(
      map((action: any) => action.payload),
      switchMap(() => this.treatmentService.getAllTreatmentGroup().pipe(
        switchMap((response: any) => of(new fromActionsCatalogue.FindGroupsSuccess(response))),
        catchError((err: HttpErrorResponse) => of(new fromActionsCatalogue.CatalogueFailure({ error: err.error }))),
      )),
    ));

  selectedData$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueSelected),
    tap((data: any) => this.router.navigate([this.translate.currentLang, 'catalogues', data.payload.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions$.pipe(
    ofType(fromActionsCatalogue.CatalogueActionTypes.catalogueSaveSuccess),
  ), { dispatch: false });

  constructor(private readonly translate: TranslateService, private actions$: Actions,
              private catalogueService: CatalogueService,
              private treatmentService: TreatmentService, private router: Router) {
  }
}
