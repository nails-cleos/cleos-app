import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { ITreatmentGroupAll } from '../../interfaces/treatment';
import { CATALOGUE_FEATURE_KEY, CatalogueState } from '../reducers/catalogue.reducers';
import { ICatalogueAll } from '../../interfaces/catalogue';

const selectCatalogueState = createFeatureSelector<CatalogueState>(CATALOGUE_FEATURE_KEY);

const selectCatalogueData = createSelector(
  selectCatalogueState,
  (state: CatalogueState) => state?.data,
);
export const getCatalogueListPipe = pipe(
  select(selectCatalogueData),
  filter((val): val is ICatalogueAll[] => val !== undefined),
);

const selectedCatalogue = createSelector(
  selectCatalogueState,
  (state: CatalogueState) => state?.selected,
);
export const getSelectedCataloguePipe = pipe(
  select(selectedCatalogue),
  filter((val): val is ICatalogueAll => val !== undefined),
);

const selectSubErrors = createSelector(
  selectCatalogueState,
  (state: CatalogueState) => state?.subErrors,
);
export const getSubErrorsPipe = pipe(
  select(selectSubErrors),
  filter((val): val is IError[] => val !== undefined),
);

const selectGroups = createSelector(
  selectCatalogueState,
  (state: CatalogueState) => state?.groups,
);
export const getGroupPipe = pipe(
  select(selectGroups),
  filter((val): val is ITreatmentGroupAll[] => val !== undefined),
);

export const selectCatalogueResponse = createSelector(
  selectCatalogueState,
  (state: CatalogueState) => state?.response,
);
export const getCatalogueResponsePipe = pipe(
  select(selectCatalogueResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);

export const selectCatalogueError = createSelector(
  selectCatalogueState,
  (state: CatalogueState) => state?.error,
);

export const selectCatalogueIsLoading = createSelector(
  selectCatalogueState,
  (state: CatalogueState) => state?.isLoading,
);
