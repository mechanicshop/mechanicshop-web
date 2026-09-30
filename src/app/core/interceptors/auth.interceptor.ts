import {
  HttpErrorResponse,
  HttpHandlerFn,
  HttpInterceptorFn,
  HttpRequest,
} from '@angular/common/http';
import { inject } from '@angular/core';

import { AuthService } from '@Features/auth/auth.service';
import { catchError, switchMap, throwError } from 'rxjs';

export const authInterceptor: HttpInterceptorFn = (
  req: HttpRequest<unknown>,
  next: HttpHandlerFn,
) => {
  const authService = inject(AuthService);
  const token = authService.getAccessToken();
  const isAuthRequest =
    req.url.includes('/identity/token/generate') ||
    req.url.includes('/identity/token/refresh-token');

  if (token && !isAuthRequest) {
    const cloned = req.clone({
      withCredentials: true,
      headers: req.headers.set('Authorization', `Bearer ${token}`),
    });
    return next(cloned).pipe(
      catchError((error: unknown) => {
        if (!(error instanceof HttpErrorResponse) || error.status !== 401) {
          return throwError(() => error);
        }

        return authService.refreshAccessToken(token).pipe(
          switchMap((newToken) => {
            const retriedRequest = req.clone({
              withCredentials: true,
              headers: req.headers.set('Authorization', `Bearer ${newToken}`),
            });
            return next(retriedRequest);
          }),
          catchError((refreshError: unknown) => {
            authService.clearSession();
            return throwError(() => refreshError);
          }),
        );
      }),
    );
  }

  return next(req.clone({ withCredentials: true }));
};
