import { Action } from '@ngrx/store';

export enum CatalogueActionTypes {
  GET_ALL = '[Catalogue] Get all',
  CATALOGUE_SUCCESS = '[Catalogue] Success',
  CATALOGUE_SAVE = '[Catalogue] Save',
  CATALOGUE_UPDATE = '[Catalogue] Update',
  CATALOGUE_UPDATE_ALL = '[Catalogue] Update all',
  CATALOGUE_SAVE_SUCCESS = '[Catalogue] Save Success',
  CATALOGUE_FAILURE = '[Catalogue] Failure',
  CATALOGUE_SELECTED = '[Catalogue] Selected',
  CATALOGUE_FIND = '[Catalogue] Find',
  CATALOGUE_DELETE = '[Catalogue] Delete',
  CLEAN = '[Catalogue] Clean'
}

export class GetAll implements Action {
  readonly type = CatalogueActionTypes.GET_ALL;
}

export class CatalogueSuccess implements Action {
  readonly type = CatalogueActionTypes.CATALOGUE_SUCCESS;

  constructor(public payload: any) {
  }
}

export class CatalogueSave implements Action {
  readonly type = CatalogueActionTypes.CATALOGUE_SAVE;

  constructor(public payload: any) {
  }
}

export class CatalogueUpdate implements Action {
  readonly type = CatalogueActionTypes.CATALOGUE_UPDATE;

  constructor(public payload: any) {
  }
}

export class CatalogueUpdateAll implements Action {
  readonly type = CatalogueActionTypes.CATALOGUE_UPDATE_ALL;

  constructor(public payload: any) {
  }
}

export class CatalogueSaveSuccess implements Action {
  readonly type = CatalogueActionTypes.CATALOGUE_SAVE_SUCCESS;

  constructor(public payload: any) {
  }
}

export class CatalogueFailure implements Action {
  readonly type = CatalogueActionTypes.CATALOGUE_FAILURE;

  constructor(public payload: any) {
  }
}

export class CatalogueSelected implements Action {
  readonly type = CatalogueActionTypes.CATALOGUE_SELECTED;

  constructor(public payload: any) {
  }
}

export class CatalogueFind implements Action {
  readonly type = CatalogueActionTypes.CATALOGUE_FIND;

  constructor(public payload: any) {
  }
}

export class DeleteCatalogue implements Action {
  readonly type = CatalogueActionTypes.CATALOGUE_DELETE;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = CatalogueActionTypes.CLEAN;
}

export type All =
  | GetAll
  | CatalogueSave
  | CatalogueUpdate
  | CatalogueUpdateAll
  | CatalogueSuccess
  | CatalogueSaveSuccess
  | CatalogueFailure
  | CatalogueFind
  | CatalogueSelected
  | DeleteCatalogue
  | Clean;
