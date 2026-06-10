import { computed, Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';
import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import { from, map, Observable, of } from 'rxjs';
import { Profile } from '../../shared/models/library.model';
import { SupabaseService } from './supabase.service';

export const INVALID_CREDENTIALS_MESSAGE = 'Invalid email or password';

export interface SignUpOptions {
  displayName?: string;
  isAuthor?: boolean;
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

  constructor(
    private readonly supabase: SupabaseService,
    private readonly router: Router,
  ) {
    void this.init();
  }

  private async init(): Promise<void> {
    const { data } = await this.supabase.client.auth.getSession();
    this.sessionSignal.set(data.session);
    if (data.session?.user) {
      await this.loadProfile(data.session.user.id);
    }
    this.loadingSignal.set(false);

    this.supabase.client.auth.onAuthStateChange((_event: AuthChangeEvent, session) => {
      this.sessionSignal.set(session);
      if (session?.user) {
        void this.loadProfile(session.user.id);
      } else {
        this.profileSignal.set(null);
      }
    });
  }

  signIn(email: string, password: string): Observable<void> {
    return from(
      this.supabase.client.auth.signInWithPassword({ email, password }).then(({ error }) => {
        if (error) {
          throw new Error(INVALID_CREDENTIALS_MESSAGE);
        }
      }),
    );
  }

  signUp(email: string, password: string, options: SignUpOptions = {}): Observable<void> {
    return from(
      this.supabase.client.auth
        .signUp({
          email,
          password,
          options: {
            data: {
              display_name: options.displayName ?? email.split('@')[0],
              is_author: options.isAuthor ?? false,
            },
          },
        })
        .then(({ error }) => {
          if (error) {
            throw new Error(error.message);
          }
        }),
    );
  }

  signOut(): Observable<void> {
    return from(
      this.supabase.client.auth.signOut().then(({ error }) => {
        if (error) {
          throw new Error(error.message);
        }
        void this.router.navigateByUrl('/');
      }),
    );
  }

  resetPassword(email: string): Observable<void> {
    return from(
      this.supabase.client.auth
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
    const { data, error } = await this.supabase.client
      .from('profiles')
      .select('id, display_name, is_author, storage_bytes_used, created_at')
      .eq('id', userId)
      .maybeSingle();

    if (!error && data) {
      this.profileSignal.set(data as Profile);
    }
  }
}
