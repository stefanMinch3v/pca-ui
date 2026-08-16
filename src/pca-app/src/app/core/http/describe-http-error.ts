import { HttpErrorResponse } from '@angular/common/http';
import { ProblemDetails } from '../models/problem-details.model';

/**
 * Extracts a human-readable message from an API failure. Shared by the
 * error interceptor (toasts) and the NgRx effects (state) so both surfaces
 * report the same, actual reason instead of a generic fallback -
 * `HttpErrorResponse` does not extend `Error`, so a naive
 * `error instanceof Error` check always misses it.
 */
export function describeHttpError(error: unknown): string {
  if (error instanceof HttpErrorResponse) {
    const problem = error.error as ProblemDetails | null;
    if (problem?.errors?.length) {
      return problem.errors.join(' ');
    }
    return problem?.detail ?? problem?.title ?? error.message;
  }

  return error instanceof Error ? error.message : 'Something went wrong.';
}
