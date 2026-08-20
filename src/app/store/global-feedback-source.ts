import { InjectionToken, Provider, Type } from '@angular/core';
import { IError, IResponseSuccess } from '../interfaces/common';

export interface GlobalFeedbackSource {
  response(): IResponseSuccess | undefined;
  error(): IError | undefined;
  clearResponse(): void;
  clearBlob?(): void;
  clearError(): void;
}

export const GLOBAL_FEEDBACK_SOURCE = new InjectionToken<
  GlobalFeedbackSource[]
>('GLOBAL_FEEDBACK_SOURCE');

export const provideGlobalFeedbackSource = (
  token: Type<GlobalFeedbackSource>,
): Provider => ({
  provide: GLOBAL_FEEDBACK_SOURCE,
  multi: true,
  useExisting: token,
});
