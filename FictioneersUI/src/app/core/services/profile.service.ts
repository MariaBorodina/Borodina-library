import { Injectable } from '@angular/core';
import { catchError, map } from 'rxjs/operators';
import { Observable, of } from 'rxjs';
import { getSeedAuthorById } from '../data/author.seed';
import { Profile } from '../../shared/models/library.model';
import { SupabaseService } from './supabase.service';
import { fromSupabaseQuery, withAbortSignal } from './supabase-observable';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  constructor(private readonly supabase: SupabaseService) {}

  getProfileById(id: string): Observable<Profile | undefined> {
    if (!this.supabase.isConfigured) {
      return of(getSeedAuthorById(id));
    }

    return fromSupabaseQuery<Profile | null>((signal) => {
      const builder = this.supabase.requireClient()
        .from('profiles')
        .select('id, display_name, is_author, storage_bytes_used, created_at')
        .eq('id', id)
        .maybeSingle();

      return withAbortSignal(builder, signal).then(({ data, error }) => ({
        data: data as Profile | null,
        error,
      }));
    }).pipe(
      map((data) => data ?? undefined),
      catchError(() => of(getSeedAuthorById(id))),
    );
  }
}
