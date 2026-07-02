import { noopInterceptor } from './noop-interceptor';
import { loadingInterceptor } from './loading-interceptor';
import { authInterceptor } from './auth-interceptor';
import { errorInterceptor } from './error-interceptor';
import { requestOptionInterceptor } from './request-option-interceptor';
import { paginationInterceptor } from './pagination-interceptor';

export const httpInterceptorProviders = [
  noopInterceptor,
  loadingInterceptor,
  authInterceptor,
  errorInterceptor,
  requestOptionInterceptor,
  paginationInterceptor,
];

export const isExternalUrl = (url: string): boolean =>
  url.includes('maps.googleapis.com') || url.includes('paypalobjects.com') || url.includes('assets') ||
  url.includes('ipapi.co') || url.includes('lambda-url');
