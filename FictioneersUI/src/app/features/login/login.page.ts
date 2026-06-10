import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService, INVALID_CREDENTIALS_MESSAGE } from '../../core/services/auth.service';

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
  protected readonly loading = signal(false);

  toggleMode(): void {
    this.isSignUp = !this.isSignUp;
    this.errorMessage.set('');
  }

  submit(event: Event): void {
    event.preventDefault();
    this.errorMessage.set('');
    this.loading.set(true);

    const action = this.isSignUp
      ? this.auth.signUp(this.email, this.password, {
          displayName: this.displayName || undefined,
          isAuthor: this.isAuthorSignup,
        })
      : this.auth.signIn(this.email, this.password);

    action.subscribe({
      next: () => {
        this.loading.set(false);
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/';
        void this.router.navigateByUrl(returnUrl);
      },
      error: (err: Error) => {
        this.loading.set(false);
        this.errorMessage.set(err.message || INVALID_CREDENTIALS_MESSAGE);
      },
    });
  }
}
