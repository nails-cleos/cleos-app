import { noopInterceptor } from './noop-interceptor';
import { authInterceptor } from './auth-interceptor';
import { errorInterceptor } from './error-interceptor';
import { requestOptionInterceptor } from './request-option-interceptor';

export const httpInterceptorProviders = [
  noopInterceptor,
  authInterceptor,
  errorInterceptor,
  requestOptionInterceptor,
];

export const isExternalUrl = (url: string): boolean =>
  url.includes('maps.googleapis.com') || url.includes('paypalobjects.com') || url.includes('assets') || url.includes('ipapi.co');
