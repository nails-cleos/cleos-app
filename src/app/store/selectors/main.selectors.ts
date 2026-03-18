import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { MAIN_FEATURE_KEY, MainState } from '../reducers/main.reducers';
import { IError, IResponseSuccess } from '../../interfaces/common';
import { ICatalogueAll } from '../../interfaces/catalogue';

const selectMainState = createFeatureSelector<MainState>(MAIN_FEATURE_KEY);

const selectCurrentLang = createSelector(
  selectMainState,
  (state: MainState) => state?.currentLang,
);
export const getCurrentLangPipe = pipe(
  select(selectCurrentLang),
  filter((val): val is string => val !== undefined),
);

const selectCurrentTreatmentId = createSelector(
  selectMainState,
  (state: MainState) => state?.currentTreatmentId,
);
export const getCurrentTreatmentIdPipe = pipe(
  select(selectCurrentTreatmentId),
  filter((val): val is string => val !== undefined),
);

const selectCatalogue = createSelector(
  selectMainState,
  (state: MainState) => state?.catalogue,
);
export const getCataloguePipe = pipe(
  select(selectCatalogue),
  filter((val): val is ICatalogueAll[] => val !== undefined),
);

const selectMainError = createSelector(
  selectMainState,
  (state: MainState) => state?.error,
);
export const getMainErrorPipe = pipe(
  select(selectMainError),
  filter((val): val is IError => val !== undefined),
);

const selectResponse = createSelector(
  selectMainState,
  (state: MainState) => state?.response,
);
export const getResponsePipe = pipe(
  select(selectResponse),
  filter((val): val is IResponseSuccess => val !== undefined),
);
