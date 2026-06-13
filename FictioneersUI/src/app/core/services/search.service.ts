import { Injectable } from '@angular/core';
import { from, map, Observable } from 'rxjs';
import { Book } from '../../shared/models/library.model';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class SearchService {
  constructor(private readonly supabase: SupabaseService) {}

  searchBooks(query: string, limit = 50): Observable<Book[]> {
    return from(
      this.supabase.requireClient().rpc('search_books', {
        p_query: query.trim(),
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
