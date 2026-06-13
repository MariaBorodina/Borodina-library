import { computed, inject, Injectable, NgZone, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { AuthChangeEvent, AuthError, Session, User } from '@supabase/supabase-js';
import { from, Observable, throwError } from 'rxjs';
import { Profile } from '../../shared/models/library.model';
import { SupabaseService } from './supabase.service';

export const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';
export const SUPABASE_NOT_CONFIGURED_MESSAGE =
  'Sign-in is unavailable. Configure Supabase to enable login.';
export const EMAIL_NOT_CONFIRMED_MESSAGE =
  'Please confirm your email before logging in. Check your inbox for the confirmation link.';
export const EMAIL_CONFIRMATION_SENT_MESSAGE =
  'Account created. Check your email for a confirmation link, then log in.';
export const NETWORK_ERROR_MESSAGE =
  'Could not reach the server. Check your connection and try again.';
export const SIGNUP_NETWORK_UNCERTAIN_MESSAGE =
  'Connection was interrupted. If you received a confirmation email, your account was created—check your inbox, then log in.';

export type AuthCompletion = 'session' | 'email_confirmation_pending';

export interface SignUpOptions {
  displayName?: string;
  isAuthor?: boolean;
}

function isNetworkError(error: unknown): boolean {
  if (error instanceof TypeError) {
    return true;
  }
  const message = error instanceof Error ? error.message : String(error);
  return /fetch failed|failed to fetch|networkerror|network error|load failed/i.test(message);
}

function mapAuthError(error: AuthError | Error): string {
  const message = error.message ?? '';
  const code = 'code' in error ? String(error.code) : '';

  if (
    code === 'email_not_confirmed' ||
    message.toLowerCase().includes('email not confirmed')
  ) {
    return EMAIL_NOT_CONFIRMED_MESSAGE;
  }

  if (
    code === 'invalid_credentials' ||
    message.toLowerCase().includes('invalid login credentials')
  ) {
    return INVALID_CREDENTIALS_MESSAGE;
  }

  if (isNetworkError(error)) {
    return NETWORK_ERROR_MESSAGE;
  }

  return message || 'Authentication failed';
}

function mapSignUpError(error: unknown): string {
  if (isNetworkError(error)) {
    return SIGNUP_NETWORK_UNCERTAIN_MESSAGE;
  }
  if (error instanceof Error) {
    return mapAuthError(error);
  }
  return 'Authentication failed';
}

async function withNetworkRetry<T>(operation: () => Promise<T>, retries = 1): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries > 0 && isNetworkError(error)) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      return withNetworkRetry(operation, retries - 1);
    }
    throw error;
  }
}

function wrapAuthCall<T>(promise: Promise<T>): Promise<T> {
  return promise.catch((err: unknown) => {
    throw new Error(mapAuthError(err instanceof Error ? err : new Error(String(err))));
  });
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly sessionSignal = signal<Session | null>(null);
  private readonly profileSignal = signal<Profile | null>(null);
  private readonly loadingSignal = signal(true);

  readonly session = this.sessionSignal.asReadonly();
  readonly profile = this.profileSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly user = computed<User | null>(() => this.session()?.user ?? null);
  readonly isAuthenticated = computed(() => this.session() !== null);
  readonly isAuthor = computed(() => this.profile()?.is_author ?? false);

  get isConfigured(): boolean {
    return this.supabase.isConfigured;
  }

  private readonly ngZone = inject(NgZone);

  constructor(
    private readonly supabase: SupabaseService,
    private readonly router: Router,
  ) {
    void this.init();
  }

  private async init(): Promise<void> {
    if (!this.supabase.isConfigured) {
      this.loadingSignal.set(false);
      return;
    }

    const { data } = await this.supabase.requireClient().auth.getSession();
    this.sessionSignal.set(data.session);
    if (data.session?.user) {
      await this.loadProfile(data.session.user.id);
    }
    this.loadingSignal.set(false);

    this.supabase.requireClient().auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
      if (session !== null && !this.hasPersistedSession()) {
        return;
      }

      this.ngZone.run(() => {
        this.sessionSignal.set(session);
        if (session?.user) {
          void this.loadProfile(session.user.id);
        } else {
          this.profileSignal.set(null);
        }
      });
    });
  }

  signIn(email: string, password: string): Observable<void> {
    if (!this.isConfigured) {
      return throwError(() => new Error(SUPABASE_NOT_CONFIGURED_MESSAGE));
    }

    return from(
      wrapAuthCall(
        this.supabase
          .requireClient()
          .auth.signInWithPassword({ email, password })
          .then(async ({ data, error }) => {
            if (error) {
              throw error;
            }
            if (data.session?.user) {
              await this.loadProfile(data.session.user.id);
            }
          }),
      ),
    );
  }

  signUp(
    email: string,
    password: string,
    options: SignUpOptions = {},
  ): Observable<AuthCompletion> {
    if (!this.isConfigured) {
      return throwError(() => new Error(SUPABASE_NOT_CONFIGURED_MESSAGE));
    }

    return from(
      withNetworkRetry(() => this.performSignUp(email, password, options)).catch((err: unknown) => {
        throw new Error(mapSignUpError(err));
      }),
    );
  }

  private async performSignUp(
    email: string,
    password: string,
    options: SignUpOptions,
  ): Promise<AuthCompletion> {
    if (this.isAuthenticated()) {
      const { error } = await this.supabase.requireClient().auth.signOut();
      if (error) {
        throw error;
      }
      this.sessionSignal.set(null);
      this.profileSignal.set(null);
    }

    const { data, error } = await this.supabase.requireClient().auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/login`,
        data: {
          display_name: options.displayName ?? email.split('@')[0],
          is_author: options.isAuthor ?? false,
        },
      },
    });

    if (error) {
      throw error;
    }

    if (!data.session?.user) {
      return 'email_confirmation_pending';
    }

    await this.loadProfile(data.session.user.id);
    return 'session';
  }

  /** Ensures profile is loaded for the current session (e.g. before author-guarded navigation). */
  waitForProfile(): Promise<void> {
    const userId = this.user()?.id;
    if (!userId) {
      return Promise.resolve();
    }
    if (this.profile()?.id === userId) {
      return Promise.resolve();
    }
    return this.loadProfile(userId);
  }

  signOut(): void {
    void this.performSignOut();
  }

  private async performSignOut(): Promise<void> {
    this.clearSession();
    await this.router.navigateByUrl('/');

    if (!this.isConfigured) {
      return;
    }

    void this.supabase
      .requireClient()
      .auth.signOut({ scope: 'local' })
      .catch((err: unknown) => {
        console.warn('Background sign-out failed.', err);
      });
  }

  private clearSession(): void {
    this.removePersistedSession();
    this.ngZone.run(() => {
      this.sessionSignal.set(null);
      this.profileSignal.set(null);
    });
  }

  private removePersistedSession(): void {
    for (const storage of [localStorage, sessionStorage]) {
      for (const key of Object.keys(storage)) {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          storage.removeItem(key);
        }
      }
    }
  }

  private hasPersistedSession(): boolean {
    for (const storage of [localStorage, sessionStorage]) {
      for (const key of Object.keys(storage)) {
        if (key.startsWith('sb-') && key.endsWith('-auth-token')) {
          return true;
        }
      }
    }
    return false;
  }

  resetPassword(email: string): Observable<void> {
    return from(
      this.supabase.requireClient().auth
        .resetPasswordForEmail(email, { redirectTo: `${window.location.origin}/login` })
        .then(({ error }) => {
          if (error) {
            throw new Error(error.message);
          }
        }),
    );
  }

  getAccessToken(): string | undefined {
    return this.session()?.access_token;
  }

  isSessionExpiredError(error: unknown): boolean {
    if (error && typeof error === 'object' && 'status' in error) {
      return (error as { status: number }).status === 401;
    }
    if (error && typeof error === 'object' && 'code' in error) {
      return (error as { code: string }).code === '42501';
    }
    return false;
  }

  private async loadProfile(userId: string): Promise<void> {
    try {
      const { data, error } = await this.supabase
        .requireClient()
        .from('profiles')
        .select('id, display_name, is_author, storage_bytes_used, created_at')
        .eq('id', userId)
        .maybeSingle();

      if (!error && data) {
        this.profileSignal.set(data as Profile);
      }
    } catch {
      // Profile fetch is best-effort; a valid auth session should still work.
    }
  }
}
