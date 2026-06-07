import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { RealmService } from './realm.service';

describe('RealmService', () => {
  let service: RealmService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
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
});
