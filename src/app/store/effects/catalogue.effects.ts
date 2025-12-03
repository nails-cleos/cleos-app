import { HttpErrorResponse } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import {
  catalogueFailure,
  catalogueSaveSuccess,
  catalogueSelected,
  catalogueSuccess,
  createCatalogue,
  deleteCatalogue,
  findGroupsSuccess,
  getAllCatalogs,
  getAllCatalogues,
  getAllTreatmentsGroup,
  getCatalogue,
  updateCatalogue,
  updateCatalogueOrder,
} from '../catalogue.actions';
import { TranslateService } from '@ngx-translate/core';
import { CatalogueService } from '../../services/catalogue.service';
import { Router } from '@angular/router';
import { TreatmentService } from '../../services/treatment.service';
import { ICatalogueAll } from '../../interfaces/catalogue';
import { ITreatmentGroupAll } from '../../interfaces/treatment';
import { IApiResponse, success } from '../../interfaces/common';

@Injectable()
export class CatalogueEffects {
  private readonly translate: TranslateService = inject(TranslateService);
  private readonly actions: Actions = inject(Actions);
  private readonly catalogueService: CatalogueService = inject(CatalogueService);
  private readonly treatmentService: TreatmentService = inject(TreatmentService);
  private readonly router: Router = inject(Router);

  getAll$ = createEffect(() => this.actions.pipe(
    ofType(getAllCatalogues),
    switchMap(() => this.catalogueService.getAllCatalogues().pipe(
      map((data: ICatalogueAll[]) => catalogueSuccess(data ? { data } : { data: [] })),
      catchError((err: HttpErrorResponse) => of(catalogueFailure({ error: err.error }))),
    )),
  ));

  getAllCatalogs$ = createEffect(() => this.actions.pipe(
    ofType(getAllCatalogs),
    switchMap(() => this.catalogueService.getAllCatalogs().pipe(
      map((data: ICatalogueAll[]) => catalogueSuccess(data ? { data } : { data: [] })),
      catchError((err: HttpErrorResponse) => of(catalogueFailure({ error: err.error }))),
    )),
  ));

  findOne$ = createEffect(() => this.actions.pipe(
    ofType(getCatalogue),
    switchMap(({ id }) => this.catalogueService.getCatalogue(id).pipe(
      map((selected?: ICatalogueAll) => catalogueSelected({ selected })),
      catchError((err: HttpErrorResponse) => of(catalogueFailure({ error: err.error }))),
    )),
  ));

  save$ = createEffect(() => this.actions.pipe(
    ofType(createCatalogue),
    switchMap(({ catalogue, resizedImageDataUrl }) =>
      this.catalogueService.createCatalogue(catalogue, resizedImageDataUrl).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('CATALOGUE.CREATED', { name: response.name });
          const path = `catalogues/${response.id}`;
          return success(catalogueSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(catalogueFailure({ error: err.error }))),
      )),
  ));

  update$ = createEffect(() => this.actions.pipe(
    ofType(updateCatalogue),
    switchMap(({ id, catalogue, resizedImageDataUrl }) =>
      this.catalogueService.updateCatalogue(id, catalogue, resizedImageDataUrl).pipe(
        switchMap((response: IApiResponse) => {
          const message = this.translate.instant('CATALOGUE.UPDATED.MESSAGE', { name: response.name });
          const path = `catalogues/${response.id}`;
          return success(catalogueSaveSuccess, message, path);
        }),
        catchError((err: HttpErrorResponse) => of(catalogueFailure({ error: err.error }))),
      )),
  ));

  updateAll$ = createEffect(() => this.actions.pipe(
    ofType(updateCatalogueOrder),
    switchMap(({ catalogues }) =>
      this.catalogueService.updateCatalogueOrder(catalogues).pipe(
        switchMap(() => {
          const message = this.translate.instant('CATALOGUE.UPDATED.ALL.MESSAGE');
          return success(catalogueSaveSuccess, message);
        }),
        catchError((err: HttpErrorResponse) => of(catalogueFailure({ error: err.error }))),
      )),
  ));

  delete$ = createEffect(() => this.actions.pipe(
    ofType(deleteCatalogue),
    switchMap(({ id, name }) =>
      this.catalogueService.deleteCatalogue(id).pipe(
        switchMap(() => {
          const message = this.translate.instant('CATALOGUE.DELETED.MESSAGE', { name });
          return success(catalogueSaveSuccess, message, undefined, undefined, 'warning');
        }),
        catchError((err: HttpErrorResponse) => of(catalogueFailure({ error: err.error }))),
      )),
  ));

  findGroups$ = createEffect(() => this.actions.pipe(
    ofType(getAllTreatmentsGroup),
    switchMap(() => this.treatmentService.getAllTreatmentsGroup().pipe(
      map((groups: ITreatmentGroupAll[]) => findGroupsSuccess({ groups })),
      catchError((err: HttpErrorResponse) => of(catalogueFailure({ error: err.error }))),
    )),
  ));

  selectedData$ = createEffect(() => this.actions.pipe(
    ofType(catalogueSelected),
    tap(({ selected }) => this.router.navigate([this.translate.currentLang, 'catalogues', selected?.id])),
  ), { dispatch: false });

  dataSuccess$ = createEffect(() => this.actions.pipe(
    ofType(catalogueSuccess),
  ), { dispatch: false });

  saveSuccess$ = createEffect(() => this.actions.pipe(
    ofType(catalogueSaveSuccess),
  ), { dispatch: false });
}
