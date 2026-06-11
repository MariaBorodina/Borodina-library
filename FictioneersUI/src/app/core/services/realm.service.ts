import { Injectable } from '@angular/core';
import { from, map, Observable, of, tap } from 'rxjs';
import { catchError } from 'rxjs/operators';
// import { SEED_REALMS } from '../data/realm.seed';
import { Realm } from '../../shared/models/realm.model';
import { RealmRow } from '../../shared/models/library.model';
import { environment } from '../../../environments/environment';
import { SupabaseService } from './supabase.service';

@Injectable({ providedIn: 'root' })
export class RealmService {
  private realmsCache: Realm[] | null = null;

  constructor(private readonly supabase: SupabaseService) {}

  getRealms(): Observable<Realm[]> {
    if (this.realmsCache) {
      return of(this.realmsCache);
    }

    if (!environment.supabaseUrl) {
      // this.realmsCache = SEED_REALMS;
      // return of(SEED_REALMS);
      this.realmsCache = [];
      return of([]);
    }

    return from(
      this.supabase.client
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
        // this.realmsCache = SEED_REALMS;
        // return of(SEED_REALMS);
        this.realmsCache = [];
        return of([]);
      }),
    );
  }

  getRealmBySlug(slug: string): Observable<Realm | undefined> {
    if (!environment.supabaseUrl) {
      // return of(SEED_REALMS.find((realm) => realm.slug === slug));
      return of(undefined);
    }

    return from(
      this.supabase.client
        .from('realms_with_book_count')
        .select('id, slug, name, description, book_count')
        .eq('slug', slug)
        .maybeSingle(),
    ).pipe(
      map(({ data, error }) => {
        if (error) {
          throw error;
        }
        return data ? this.toRealm(data as RealmRow) : undefined;
      }),
      catchError(() => {
        // return of(SEED_REALMS.find((realm) => realm.slug === slug));
        return of(undefined);
      }),
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
