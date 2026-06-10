import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { Book, ReadingProgress } from '../../shared/models/library.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class LibraryService {
  constructor(private readonly supabase: SupabaseService) {}

  getSavedBooks(userId: string): Observable<Book[]> {
    return from(
      this.supabase.client
        .from('saved_books')
        .select('book_id, saved_at, books(*)')
        .eq('user_id', userId)
        .order('saved_at', { ascending: false }),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return (data ?? []).flatMap((row: { books: Book | Book[] | null }) => {
          if (!row.books) {
            return [];
          }
          return Array.isArray(row.books) ? row.books : [row.books];
        });
      }),
    );
  }

  saveBook(userId: string, bookId: string): Observable<void> {
    return from(
      this.supabase.client.from('saved_books').upsert({ user_id: userId, book_id: bookId }),
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      }),
    );
  }

  removeSavedBook(userId: string, bookId: string): Observable<void> {
    return from(
      this.supabase.client.from('saved_books').delete().eq('user_id', userId).eq('book_id', bookId),
    ).pipe(
      map(({ error }) => {
        if (error) {
          throw error;
        }
      }),
    );
  }

  getReadingProgress(userId: string, bookId: string): Observable<ReadingProgress | undefined> {
    return from(
      this.supabase.client
        .from('reading_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('book_id', bookId)
        .maybeSingle(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return (data as ReadingProgress | null) ?? undefined;
      }),
    );
  }

  upsertReadingProgress(
    userId: string,
    bookId: string,
    incrementId: string | null,
    pageNumber: number,
  ): Observable<ReadingProgress> {
    return from(
      this.supabase.client
        .from('reading_progress')
        .upsert(
          {
            user_id: userId,
            book_id: bookId,
            increment_id: incrementId,
            page_number: pageNumber,
          },
          { onConflict: 'user_id,book_id' },
        )
        .select()
        .single(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data as ReadingProgress;
      }),
    );
  }
}
