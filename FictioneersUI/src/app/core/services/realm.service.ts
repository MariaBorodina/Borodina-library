import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { SEED_REALMS } from '../data/realm.seed';
import { Realm } from '../../shared/models/realm.model';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class RealmService {
  getRealms(): Observable<Realm[]> {
    return this.fetchRealms().pipe(delay(150));
  }

  getRealmBySlug(slug: string): Observable<Realm | undefined> {
    return of(SEED_REALMS.find((realm) => realm.slug === slug));
  }

  /** Swap implementation to HttpClient when environment.apiUrl is configured */
  private fetchRealms(): Observable<Realm[]> {
    if (environment.apiUrl) {
      // TODO: return this.http.get<Realm[]>(`${environment.apiUrl}/realms`);
    }

    return of(SEED_REALMS);
  }
}
