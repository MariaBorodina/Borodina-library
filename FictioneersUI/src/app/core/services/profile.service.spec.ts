import { TestBed } from '@angular/core/testing';
import { firstValueFrom } from 'rxjs';
import { Profile } from '../../shared/models/library.model';
import { ProfileService } from './profile.service';
import { SupabaseService } from './supabase.service';

describe('ProfileService', () => {
  let service: ProfileService;

  const mockProfile: Profile = {
    id: 'seed-author-1',
    display_name: 'Amara Singh',
    is_author: true,
    storage_bytes_used: 0,
    created_at: '2025-06-01T00:00:00Z',
  };

  function createThenable<T>(result: { data: T | null; error: unknown }) {
    const response = Promise.resolve(result);
    return Object.assign(response, {
      abortSignal: () => response,
    });
  }

  function createSupabaseMock(options: { profile?: Profile | null; profileError?: Error } = {}) {
    const client = {
      from: () => ({
        select: () => ({
          eq: (_column: string, id: string) => ({
            maybeSingle: () => {
              if (options.profileError) {
                return createThenable({ data: null, error: options.profileError });
              }
              const profile =
                options.profile !== undefined
                  ? options.profile
                  : id === mockProfile.id
                    ? mockProfile
                    : null;
              return createThenable({ data: profile, error: null });
            },
          }),
        }),
      }),
    };

    return {
      isConfigured: true,
      client,
      requireClient: () => client,
    };
  }

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: createSupabaseMock() }],
    });
    service = TestBed.inject(ProfileService);
  });

  it('should return a profile from Supabase', async () => {
    const profile = await firstValueFrom(service.getProfileById('seed-author-1'));
    expect(profile?.display_name).toBe('Amara Singh');
  });

  it('should return undefined for an unknown profile id', async () => {
    const profile = await firstValueFrom(service.getProfileById('unknown-author'));
    expect(profile).toBeUndefined();
  });

  it('should fall back to seed profile when Supabase is not configured', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [{ provide: SupabaseService, useValue: { isConfigured: false, requireClient: () => { throw new Error(); } } }],
    });
    service = TestBed.inject(ProfileService);

    const profile = await firstValueFrom(service.getProfileById('seed-author-2'));
    expect(profile?.display_name).toBe('Lena Volkov');
  });

  it('should fall back to seed profile when Supabase fails', async () => {
    TestBed.resetTestingModule();
    TestBed.configureTestingModule({
      providers: [
        {
          provide: SupabaseService,
          useValue: createSupabaseMock({ profileError: new Error('offline') }),
        },
      ],
    });
    service = TestBed.inject(ProfileService);

    const profile = await firstValueFrom(service.getProfileById('seed-author-1'));
    expect(profile?.display_name).toBe('Amara Singh');
  });
});
