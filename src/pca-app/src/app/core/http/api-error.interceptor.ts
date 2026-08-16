import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { describeHttpError } from './describe-http-error';

/**
 * Surfaces API failures (RFC 9457 ProblemDetails, see
 * `pca.Api.Extensions.ResultExtensions`) as PrimeNG toasts, then re-throws
 * so callers can still react (e.g. keep a form open on validation errors).
 */
export const apiErrorInterceptor: HttpInterceptorFn = (req, next) => {
  const messageService = inject(MessageService);

  return next(req).pipe(
    catchError((error: unknown) => {
      if (error instanceof HttpErrorResponse) {
        messageService.add({
          severity: 'error',
          summary: `Request failed (${error.status})`,
          detail: describeHttpError(error),
        });
      }

      return throwError(() => error);
    }),
  );
};
