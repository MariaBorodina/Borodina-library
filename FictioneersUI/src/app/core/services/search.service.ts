import { Injectable } from '@angular/core';
import { from, map, Observable, of } from 'rxjs';
import { searchSeedBooks } from '../data/book.seed';
import { Book } from '../../shared/models/library.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class SearchService {
  constructor(private readonly supabase: SupabaseService) {}

  searchBooks(query: string, limit = 50): Observable<Book[]> {
    const trimmed = query.trim();
    if (!trimmed) {
      return of([]);
    }

    if (!this.supabase.isConfigured) {
      return of(searchSeedBooks(trimmed, limit));
    }

    return from(
      this.supabase.requireClient().rpc('search_books', {
        p_query: trimmed,
        p_limit: limit,
      }),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return (data ?? []) as Book[];
      }),
    );
  }
}
