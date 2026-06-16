import { Injectable } from '@angular/core';
import { catchError, tap } from 'rxjs/operators';
import { from, map, Observable, of } from 'rxjs';
import { getSeedBookById, getSeedBooksByRealm } from '../data/book.seed';
import { Book, BookStatus } from '../../shared/models/library.model';
import { SupabaseService } from './supabase.service';
import { fromSupabaseQuery, withAbortSignal } from './supabase-observable';
import { environment } from '../../../environments/environment';

export interface CreateBookInput {
  title: string;
  synopsis: string;
  realm_id: string;
  tags?: string[];
  status?: BookStatus;
}

export interface UpdateBookInput {
  title: string;
  synopsis: string;
  realm_id: string;
  tags: string[];
  status: BookStatus;
  expected_updated_at: string;
  cover_path?: string | null;
  cover_size_bytes?: number;
  force_overwrite?: boolean;
}

@Injectable({ providedIn: 'root' })
export class BookService {
  private readonly booksByRealmCache = new Map<string, Book[]>();

  constructor(private readonly supabase: SupabaseService) {}

  getBooksByRealm(realmId: string): Observable<Book[]> {
    const cached = this.booksByRealmCache.get(realmId);
    if (cached) {
      return of(cached);
    }

    if (!this.supabase.isConfigured) {
      return of(getSeedBooksByRealm(realmId));
    }

    return fromSupabaseQuery<Book[]>((signal) => {
      const builder = this.supabase.requireClient()
        .from('books')
        .select('*')
        .eq('realm_id', realmId)
        .eq('status', 'published')
        .order('title');

      return withAbortSignal(builder, signal).then(({ data, error }) => ({
        data: (data ?? []) as Book[],
        error,
      }));
    }).pipe(
      tap((books) => this.booksByRealmCache.set(realmId, books)),
      catchError(() => of([] as Book[])),
    );
  }

  getBooksByAuthor(authorId: string): Observable<Book[]> {
    if (!this.supabase.isConfigured) {
      return of([] as Book[]);
    }

    return fromSupabaseQuery<Book[]>((signal) => {
      const builder = this.supabase.requireClient()
        .from('books')
        .select('*')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false });

      return withAbortSignal(builder, signal).then(({ data, error }) => ({
        data: (data ?? []) as Book[],
        error,
      }));
    });
  }

  getMyBooks(authorId: string): Observable<Book[]> {
    return this.getBooksByAuthor(authorId);
  }

  getBookById(id: string): Observable<Book | undefined> {
    if (!this.supabase.isConfigured) {
      return of(getSeedBookById(id));
    }

    return fromSupabaseQuery<Book | null>((signal) => {
      const builder = this.supabase.requireClient().from('books').select('*').eq('id', id).maybeSingle();
      return withAbortSignal(builder, signal).then(({ data, error }) => ({
        data: data as Book | null,
        error,
      }));
    }).pipe(
      map((data) => data ?? undefined),
      catchError(() => of(getSeedBookById(id))),
    );
  }

  createBook(authorId: string, input: CreateBookInput): Observable<Book> {
    return from(
      this.supabase.requireClient()
        .from('books')
        .insert({
          author_id: authorId,
          title: input.title,
          synopsis: input.synopsis,
          realm_id: input.realm_id,
          tags: input.tags ?? [],
          status: input.status ?? 'draft',
        })
        .select()
        .single(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data as Book;
      }),
    );
  }

  updateBookWithVersion(bookId: string, input: UpdateBookInput): Observable<Book> {
    return from(
      this.supabase.requireClient().rpc('update_book_with_version', {
        p_book_id: bookId,
        p_expected_updated_at: input.expected_updated_at,
        p_title: input.title,
        p_synopsis: input.synopsis,
        p_realm_id: input.realm_id,
        p_tags: input.tags,
        p_status: input.status,
        p_cover_path: input.cover_path ?? null,
        p_cover_size_bytes: input.cover_size_bytes ?? null,
        p_force_overwrite: input.force_overwrite ?? false,
      }),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data as Book;
      }),
    );
  }

  deleteBookIfEmpty(bookId: string): Observable<void> {
    return from(this.supabase.requireClient().rpc('delete_book_if_empty', { p_book_id: bookId })).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      }),
    );
  }

  uploadCover(authorId: string, bookId: string, file: File): Observable<string> {
    const ext = file.name.split('.').pop()?.toLowerCase() ?? 'jpg';
    const path = `${authorId}/${bookId}/cover.${ext}`;

    return from(
      this.uploadCoverViaEdgeFunction(path, file),
    ).pipe(
      map((result) => result.publicUrl ?? result.path ?? path),
    );
  }

  getCoverPublicUrl(path: string | null): string | null {
    if (!path) {
      return null;
    }

    if (path.startsWith('http://') || path.startsWith('https://')) {
      return path;
    }

    const { data } = this.supabase.requireClient().storage.from('book-covers').getPublicUrl(path);
    return data.publicUrl;
  }

  private async uploadCoverViaEdgeFunction(
    path: string,
    file: File,
  ): Promise<{ path?: string; publicUrl?: string }> {
    const client = this.supabase.requireClient();
    const { data: sessionData, error: sessionError } = await client.auth.getSession();
    if (sessionError || !sessionData.session?.access_token) {
      throw new Error('Not authenticated');
    }

    const controller = new AbortController();
    const timeoutId = window.setTimeout(() => controller.abort(), 60_000);
    const fileBlob = new Blob([await file.arrayBuffer()], { type: file.type });

    // Вместо отправки сырых байт, упаковываем файл в FormData
    const formData = new FormData();
    formData.append('file', file); // Ключ, по которому Deno заберет файл

    try {
      const response = await fetch(
        `${environment.supabaseUrl}/functions/v1/upload-book-cover?path=${encodeURIComponent(path)}&contentType=${encodeURIComponent(file.type)}&upsert=true`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${sessionData.session.access_token}`,
            apikey: environment.supabaseAnonKey,
           //'Content-Type': 'application/octet-stream',
          },
          body: formData,
          signal: controller.signal,
        },
      );



      const result = (await response.json().catch(() => ({}))) as {
        error?: string;
        path?: string;
        publicUrl?: string;
      };

      if (!response.ok) {
        throw new Error(result.error || `Cover upload failed (${response.status})`);
      }

      return result;
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('Cover upload timed out. Please try again.');
      }
      throw error;
    } finally {
      window.clearTimeout(timeoutId);
    }
  }

  mapBookError(error: unknown): string {
    if (error && typeof error === 'object') {
      const err = error as { message?: string; code?: string };
      if (err.message?.includes('duplicate key') || err.code === '23505') {
        return 'You already have a book with this title. Please use a different title.';
      }
      if (err.message?.includes('Cannot delete book')) {
        return err.message;
      }
      if (err.code === 'BOOK_CONFLICT' || err.message?.includes('modified by another session')) {
        return 'This book was modified by another session. Refresh to see latest changes.';
      }
      if (err.message?.includes('Storage quota exceeded')) {
        return 'Storage quota exceeded';
      }
      if (err.message) {
        return err.message;
      }
    }
    return 'Failed to save changes. Please try again.';
  }
}
