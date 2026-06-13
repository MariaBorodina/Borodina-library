import { computed, signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { GuardResult, provideRouter, Router, UrlTree } from '@angular/router';
import { firstValueFrom, isObservable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { authGuard } from './auth.guard';

describe('authGuard', () => {
  let router: Router;

  async function runGuard(options: {
    loading: boolean;
    isAuthenticated: boolean;
    url?: string;
  }): Promise<GuardResult> {
    const loadingSignal = signal(options.loading);

    await TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        {
          provide: AuthService,
          useValue: {
            loading: loadingSignal,
            isAuthenticated: computed(() => options.isAuthenticated),
          },
        },
      ],
    }).compileComponents();

    router = TestBed.inject(Router);

    const result = TestBed.runInInjectionContext(() =>
      authGuard({} as never, { url: options.url ?? '/my-books' } as never),
    );

    if (isObservable(result)) {
      if (options.loading) {
        loadingSignal.set(false);
      }
      return firstValueFrom(result);
    }

    return result;
  }

  it('should allow access when authenticated after session loads', async () => {
    const result = await runGuard({ loading: false, isAuthenticated: true });
    expect(result).toBe(true);
  });

  it('should redirect to login with returnUrl when not authenticated', async () => {
    const result = await runGuard({ loading: false, isAuthenticated: false });

    expect(result instanceof UrlTree).toBe(true);
    const urlTree = result as UrlTree;
    expect(router.serializeUrl(urlTree)).toBe('/login?returnUrl=%2Fmy-books');
  });

  it('should wait for session loading before deciding', async () => {
    const result = await runGuard({ loading: true, isAuthenticated: false });
    expect(result instanceof UrlTree).toBe(true);
  });
});
