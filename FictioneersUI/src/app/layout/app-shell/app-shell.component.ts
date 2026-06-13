import { Component, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly isAuthor = this.auth.isAuthor;

  logout(): void {
    this.auth.signOut();
  }
}
