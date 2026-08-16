import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { MessageService } from 'primeng/api';
import { catchError, throwError } from 'rxjs';
import { ProblemDetails } from '../models/problem-details.model';

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
          detail: describeError(error),
        });
      }

      return throwError(() => error);
    }),
  );
};

function describeError(error: HttpErrorResponse): string {
  const problem = error.error as ProblemDetails | null;
  if (problem?.errors?.length) {
    return problem.errors.join(' ');
  }

  return problem?.detail ?? problem?.title ?? error.message;
}
