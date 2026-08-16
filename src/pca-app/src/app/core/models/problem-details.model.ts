/**
 * RFC 9457 ProblemDetails shape returned by the API for failed requests
 * (see `pca.Api.Extensions.ResultExtensions.ToProblemDetails` and
 * `pca.Api.GlobalExceptionHandler`). Field-level validation failures are
 * carried in the `errors` extension as plain messages.
 */
export interface ProblemDetails {
  readonly type?: string;
  readonly title?: string;
  readonly status?: number;
  readonly detail?: string;
  readonly instance?: string;
  readonly errors?: readonly string[];
}
