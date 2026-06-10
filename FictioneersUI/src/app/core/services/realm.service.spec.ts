import { TestBed } from '@angular/core/testing';
import { firstValueFrom, of } from 'rxjs';
import { SEED_REALMS } from '../data/realm.seed';
import { RealmService } from './realm.service';
import { SupabaseService } from './supabase.service';

describe('RealmService', () => {
  let service: RealmService;

  const supabaseMock = {
    client: {
      from: () => ({
        select: () => ({
          order: () =>
            Promise.resolve({
              data: null,
              error: new Error('offline'),
            }),
          eq: () => ({
            maybeSingle: () =>
              Promise.resolve({
                data: null,
                error: new Error('offline'),
              }),
          }),
        }),
      }),
    },
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: supabaseMock }],
    });
    service = TestBed.inject(RealmService);
  });

  it('should return a non-empty list of realms', async () => {
    const realms = await firstValueFrom(service.getRealms());
    expect(realms.length).toBeGreaterThan(0);
  });

  it('should return realms with required fields', async () => {
    const realms = await firstValueFrom(service.getRealms());
    for (const realm of realms) {
      expect(realm.id).toBeTruthy();
      expect(realm.slug).toBeTruthy();
      expect(realm.name).toBeTruthy();
    }
  });

  it('should find a realm by slug', async () => {
    const realm = await firstValueFrom(service.getRealmBySlug('hard-sci-fi'));
    expect(realm?.name).toBe('Hard Sci-Fi');
  });

  it('should return undefined for an unknown slug', async () => {
    const realm = await firstValueFrom(service.getRealmBySlug('unknown-realm'));
    expect(realm).toBeUndefined();
  });

  it('should include all nine seed realms when Supabase is unavailable', async () => {
    const realms = await firstValueFrom(service.getRealms());
    expect(realms).toHaveLength(9);
  });

  it('should include realms with zero books for empty-detail testing', async () => {
    const realms = await firstValueFrom(service.getRealms());
    const emptyRealm = realms.find((realm) => realm.slug === 'time-travel-archives');
    expect(emptyRealm?.name).toBe('Time Travel Archives');
    expect(emptyRealm?.bookCount).toBe(0);
  });
});
