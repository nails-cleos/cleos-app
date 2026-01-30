import { createFeatureSelector, createSelector, select } from '@ngrx/store';
import { filter, pipe } from 'rxjs';
import { I18N_FEATURE_KEY, I18NState } from '../reducers/i18n.reducers';

const selectI18NState = createFeatureSelector<I18NState>(I18N_FEATURE_KEY);

const selectI18NLanguage = createSelector(
  selectI18NState,
  (state: I18NState) => state?.language,
);
export const getI18NLanguagePipe = pipe(
  select(selectI18NLanguage),
  filter((val): val is string => val !== undefined),
);
