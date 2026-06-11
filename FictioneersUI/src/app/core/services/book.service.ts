import { Injectable } from '@angular/core';
import { catchError } from 'rxjs/operators';
import { from, map, Observable, of } from 'rxjs';
import { getSeedBookById, getSeedBooksByRealm } from '../data/book.seed';
import { Book, BookStatus } from '../../shared/models/library.model';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';

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
  constructor(private readonly supabase: SupabaseService) {}

  getBooksByRealm(realmId: string): Observable<Book[]> {
    if (!environment.supabaseUrl) {
      return of(getSeedBooksByRealm(realmId));
    }

    return from(
      this.supabase.client
        .from('books')
        .select('*')
        .eq('realm_id', realmId)
        .eq('status', 'published')
        .order('title'),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return (data ?? []) as Book[];
      }),
      catchError(() => of(getSeedBooksByRealm(realmId))),
    );
  }

  getBooksByAuthor(authorId: string): Observable<Book[]> {
    return from(
      this.supabase.client
        .from('books')
        .select('*')
        .eq('author_id', authorId)
        .order('created_at', { ascending: false }),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return (data ?? []) as Book[];
      }),
    );
  }

  getMyBooks(authorId: string): Observable<Book[]> {
    return this.getBooksByAuthor(authorId);
  }

  getBookById(id: string): Observable<Book | undefined> {
    if (!environment.supabaseUrl) {
      return of(getSeedBookById(id));
    }

    return from(this.supabase.client.from('books').select('*').eq('id', id).maybeSingle()).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return (data as Book | null) ?? undefined;
      }),
      catchError(() => of(getSeedBookById(id))),
    );
  }

  createBook(authorId: string, input: CreateBookInput): Observable<Book> {
    return from(
      this.supabase.client
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
      this.supabase.client.rpc('update_book_with_version', {
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
    return from(this.supabase.client.rpc('delete_book_if_empty', { p_book_id: bookId })).pipe(
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
      this.supabase.client.storage.from('book-covers').upload(path, file, { upsert: true }),
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
        return path;
      }),
    );
  }

  getCoverPublicUrl(path: string | null): string | null {
    if (!path) {
      return null;
    }
    const { data } = this.supabase.client.storage.from('book-covers').getPublicUrl(path);
    return data.publicUrl;
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
