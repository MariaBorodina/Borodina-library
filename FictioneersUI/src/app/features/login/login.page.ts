import { Component, effect, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AuthService,
  EMAIL_CONFIRMATION_SENT_MESSAGE,
  INVALID_CREDENTIALS_MESSAGE,
  SUPABASE_NOT_CONFIGURED_MESSAGE,
} from '../../core/services/auth.service';

@Component({
  selector: 'app-login',
  imports: [FormsModule],
  templateUrl: './login.page.html',
})
export class LoginPage {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);

  protected email = '';
  protected password = '';
  protected displayName = '';
  protected isSignUp = false;
  protected isAuthorSignup = false;
  protected readonly errorMessage = signal('');
  protected readonly successMessage = signal('');
  protected readonly loading = signal(false);
  protected readonly isConfigured = this.auth.isConfigured;
  protected readonly supabaseNotConfiguredMessage = SUPABASE_NOT_CONFIGURED_MESSAGE;

  constructor() {
    if (this.route.snapshot.queryParamMap.get('mode') === 'signup') {
      this.isSignUp = true;
    }

    effect(() => {
      if (this.auth.loading() || !this.auth.isAuthenticated() || this.isSignUp) {
        return;
      }

      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
      void this.router.navigateByUrl(returnUrl);
    });
  }

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.errorMessage.set('');
    this.successMessage.set('');
  }

  submit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set('');
    this.successMessage.set('');

    if (!this.isConfigured) {
      this.errorMessage.set(SUPABASE_NOT_CONFIGURED_MESSAGE);
      return;
    }

    this.loading.set(true);

    if (this.isSignUp) {
      this.auth
        .signUp(this.email, this.password, {
          displayName: this.displayName || undefined,
          isAuthor: this.isAuthorSignup,
        })
        .subscribe({
          next: (result) => {
            if (result === 'email_confirmation_pending') {
              this.loading.set(false);
              this.isSignUp = false;
              this.successMessage.set(EMAIL_CONFIRMATION_SENT_MESSAGE);
              return;
            }

            void this.completeAuthenticatedLogin();
          },
          error: (err: Error) => this.handleAuthError(err),
        });
      return;
    }

    this.auth.signIn(this.email, this.password).subscribe({
      next: () => {
        void this.completeAuthenticatedLogin();
      },
      error: (err: Error) => this.handleAuthError(err),
    });
  }

  private completeAuthenticatedLogin(): void {
    void this.auth.waitForProfile().then(() => {
      this.loading.set(false);
      const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
      void this.router.navigateByUrl(returnUrl);
    });
  }

  private handleAuthError(err: Error): void {
    this.loading.set(false);
    this.errorMessage.set(err.message || INVALID_CREDENTIALS_MESSAGE);
  }
}
