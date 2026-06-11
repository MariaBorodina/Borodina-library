import { firstValueFrom } from 'rxjs';
import { fromSupabaseQuery, withAbortSignal } from './supabase-observable';

describe('fromSupabaseQuery', () => {
  it('should emit data from a successful query', async () => {
    const result = await firstValueFrom(
      fromSupabaseQuery<string[]>((_signal) => {
        const response = Promise.resolve({ data: ['a'], error: null });
        return Object.assign(response, { abortSignal: () => response });
      }),
    );

    expect(result).toEqual(['a']);
  });

  it('should abort the query signal when unsubscribed early', () => {
    let receivedSignal: AbortSignal | undefined;
    const pending = new Promise<{ data: string[]; error: null }>(() => {
      /* never resolves */
    });
    const query = Object.assign(pending, {
      abortSignal: () => pending,
    });

    const subscription = fromSupabaseQuery<string[]>((signal) => {
      receivedSignal = signal;
      return withAbortSignal(query, signal).then((result) => ({
        data: result.data as string[] | null,
        error: result.error,
      }));
    }).subscribe();

    subscription.unsubscribe();

    expect(receivedSignal?.aborted).toBe(true);
  });
});
