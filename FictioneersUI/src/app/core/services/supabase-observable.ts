import { Observable } from 'rxjs';

const QUERY_TIMEOUT_MS = 15_000;

export interface SupabaseResult<T> {
  data: T | null;
  error: unknown;
}

type AbortableQuery = {
  abortSignal?: (signal: AbortSignal) => AbortableQuery;
  then: PromiseLike<SupabaseResult<unknown>>['then'];
};

/** Applies AbortSignal when the PostgREST builder supports it (supabase-js v2). */
export function withAbortSignal<T extends AbortableQuery>(
  builder: T,
  signal: AbortSignal,
): PromiseLike<SupabaseResult<unknown>> {
  if (typeof builder.abortSignal === 'function') {
    return builder.abortSignal(signal);
  }
  return builder;
}

/**
 * Wraps a Supabase query in an Observable that aborts on unsubscribe and times out.
 * Prevents orphaned HTTP requests from exhausting the browser connection pool.
 */
export function fromSupabaseQuery<T>(
  run: (signal: AbortSignal) => PromiseLike<SupabaseResult<T>>,
): Observable<T> {
  return new Observable<T>((subscriber) => {
    const controller = new AbortController();
    let settled = false;

    const timeoutId = setTimeout(() => {
      if (!settled) {
        controller.abort();
        settled = true;
        subscriber.error(new Error('Supabase query timed out'));
      }
    }, QUERY_TIMEOUT_MS);

    Promise.resolve(run(controller.signal))
      .then(({ data, error }) => {
        if (settled || controller.signal.aborted) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        if (error) {
          subscriber.error(error);
          return;
        }
        subscriber.next(data as T);
        subscriber.complete();
      })
      .catch((err: unknown) => {
        if (settled || controller.signal.aborted) {
          return;
        }
        settled = true;
        clearTimeout(timeoutId);
        subscriber.error(err);
      });

    return () => {
      if (!settled) {
        settled = true;
        clearTimeout(timeoutId);
        controller.abort();
      }
    };
  });
}
