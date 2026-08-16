/**
 * Mirrors `pca.Application.Common.Page<TItem>` on the API: a page of items
 * from keyset (page-key) pagination, not offset/skip-take. `nextPageKey`
 * is an opaque token to pass back as `pageKey` to fetch the following page;
 * `null` means there are no more pages.
 */
export interface Page<TItem> {
  readonly items: readonly TItem[];
  readonly nextPageKey: string | null;
}
