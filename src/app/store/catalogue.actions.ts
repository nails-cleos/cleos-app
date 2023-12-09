import { Action } from '@ngrx/store';

export enum CatalogueActionTypes {
  getAll = '[Catalogue] Get all',
  getAllCatalogs = '[Catalogue] Get all catalogs',
  catalogueSuccess = '[Catalogue] Success',
  catalogueSave = '[Catalogue] Save',
  catalogueUpdate = '[Catalogue] Update',
  catalogueUpdateAll = '[Catalogue] Update all',
  catalogueSaveSuccess = '[Catalogue] Save Success',
  catalogueFailure = '[Catalogue] Failure',
  catalogueSelected = '[Catalogue] Selected',
  catalogueFind = '[Catalogue] Find',
  catalogueDelete = '[Catalogue] Delete',
  findGroups = '[Catalogue] Find treatment groups',
  findGroupsSuccess = '[Catalogue] Find treatment groups success',
  clean = '[Catalogue] Clean'
}

export class GetAll implements Action {
  readonly type = CatalogueActionTypes.getAll;
}

export class GetAllCatalogs implements Action {
  readonly type = CatalogueActionTypes.getAllCatalogs;
}

export class CatalogueSuccess implements Action {
  readonly type = CatalogueActionTypes.catalogueSuccess;

  constructor(public payload: any) {
  }
}

export class CatalogueSave implements Action {
  readonly type = CatalogueActionTypes.catalogueSave;

  constructor(public payload: any) {
  }
}

export class CatalogueUpdate implements Action {
  readonly type = CatalogueActionTypes.catalogueUpdate;

  constructor(public payload: any) {
  }
}

export class CatalogueUpdateAll implements Action {
  readonly type = CatalogueActionTypes.catalogueUpdateAll;

  constructor(public payload: any) {
  }
}

export class CatalogueSaveSuccess implements Action {
  readonly type = CatalogueActionTypes.catalogueSaveSuccess;

  constructor(public payload: any) {
  }
}

export class CatalogueFailure implements Action {
  readonly type = CatalogueActionTypes.catalogueFailure;

  constructor(public payload: any) {
  }
}

export class CatalogueSelected implements Action {
  readonly type = CatalogueActionTypes.catalogueSelected;

  constructor(public payload: any) {
  }
}

export class CatalogueFind implements Action {
  readonly type = CatalogueActionTypes.catalogueFind;

  constructor(public payload: any) {
  }
}

export class DeleteCatalogue implements Action {
  readonly type = CatalogueActionTypes.catalogueDelete;

  constructor(public payload: any) {
  }
}

export class FindGroups implements Action {
  readonly type = CatalogueActionTypes.findGroups;
}

export class FindGroupsSuccess implements Action {
  readonly type = CatalogueActionTypes.findGroupsSuccess;

  constructor(public payload: any) {
  }
}

export class Clean implements Action {
  readonly type = CatalogueActionTypes.clean;
}

export type All =
  | GetAll
  | GetAllCatalogs
  | CatalogueSave
  | CatalogueUpdate
  | CatalogueUpdateAll
  | CatalogueSuccess
  | CatalogueSaveSuccess
  | CatalogueFailure
  | CatalogueFind
  | CatalogueSelected
  | DeleteCatalogue
  | FindGroups
  | FindGroupsSuccess
  | Clean;
