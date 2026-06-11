import { Injectable } from '@angular/core';
import { from, map, Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { SEED_REALMS } from '../data/realm.seed';
import { Realm } from '../../shared/models/realm.model';
import { RealmRow } from '../../shared/models/library.model';
import { SupabaseService } from './supabase.service';
import { fromSupabaseQuery, withAbortSignal } from './supabase-observable';

@Injectable({ providedIn: 'root' })
export class RealmService {
  private realmsCache: Realm[] | null = null;

  constructor(private readonly supabase: SupabaseService) {}

  getRealms(): Observable<Realm[]> {
    if (this.realmsCache) {
      return of(this.realmsCache);
    }

    if (!this.supabase.isConfigured) {
      this.realmsCache = SEED_REALMS;
      return of(SEED_REALMS);
    }

    return from(
      this.supabase.requireClient()
        .from('realms_with_book_count')
        .select('id, slug, name, description, book_count')
        .order('sort_order'),
    ).pipe(
      map(({ data, error }) => {
        if (error || !data) {
          throw error ?? new Error('Failed to load realms');
        }
        return (data as RealmRow[]).map((row) => this.toRealm(row));
      }),
      tap((realms) => {
        this.realmsCache = realms;
      }),
      catchError(() => {
        this.realmsCache = SEED_REALMS;
        return of(SEED_REALMS);
      }),
    );
  }

  getRealmBySlug(slug: string): Observable<Realm | undefined> {
    if (!this.supabase.isConfigured) {
      return of(SEED_REALMS.find((realm) => realm.slug === slug));
    }

    return fromSupabaseQuery<Realm | undefined>((signal) => {
      const builder = this.supabase.requireClient()
        .from('realms_with_book_count')
        .select('id, slug, name, description, book_count')
        .eq('slug', slug)
        .maybeSingle();

      return withAbortSignal(builder, signal).then(({ data, error }) => ({
        data: data ? this.toRealm(data as RealmRow) : undefined,
        error,
      }));
    }).pipe(
      catchError(() => of(undefined)),
    );
  }

  private toRealm(row: RealmRow): Realm {
    return {
      id: row.id,
      slug: row.slug,
      name: row.name,
      description: row.description ?? undefined,
      bookCount: row.book_count,
    };
  }
}
