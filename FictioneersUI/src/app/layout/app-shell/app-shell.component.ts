import {
  Component,
  computed,
  effect,
  HostListener,
  inject,
  signal,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs/operators';
import { AuthService } from '../../core/services/auth.service';

type NavLinkItem = {
  type: 'link';
  label: string;
  routerLink: string | string[];
  exact?: boolean;
};

type NavPlaceholderItem = {
  type: 'placeholder';
  label: string;
  href: string;
};

type NavButtonItem = {
  type: 'button';
  label: string;
  action: () => void;
};

type NavItem = NavLinkItem | NavPlaceholderItem | NavButtonItem;

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive],
  templateUrl: './app-shell.component.html',
})
export class AppShellComponent {
  protected readonly auth = inject(AuthService);
  protected readonly isAuthenticated = this.auth.isAuthenticated;
  protected readonly isAuthor = this.auth.isAuthor;
  protected readonly menuOpen = signal(false);

  private readonly router = inject(Router);

  protected readonly navItems = computed<NavItem[]>(() => {
    const items: NavItem[] = [
      { type: 'link', label: 'Home', routerLink: '/', exact: true },
      { type: 'link', label: 'Browse by Realm', routerLink: '/realms' },
      { type: 'link', label: 'Search', routerLink: '/search' },
      { type: 'placeholder', label: 'Library', href: '#' },
      { type: 'placeholder', label: 'Collections', href: '#' },
      { type: 'link', label: 'Authors', routerLink: '/authors' },
      { type: 'placeholder', label: 'Community', href: '#' },
    ];

    if (this.isAuthenticated()) {
      items.push({ type: 'link', label: 'My Books', routerLink: '/my-books' });
      if (this.isAuthor()) {
        items.push({ type: 'link', label: 'Books by me', routerLink: '/books-by-me' });
      }
      items.push({ type: 'button', label: 'Log out', action: () => this.logout() });
    } else {
      items.push({ type: 'link', label: 'Log in', routerLink: '/login' });
    }

    return items;
  });

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(),
      )
      .subscribe(() => this.closeMenu());

    effect(() => {
      document.body.classList.toggle('nav-open', this.menuOpen());
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    this.closeMenu();
  }

  toggleMenu(): void {
    this.menuOpen.update((open) => !open);
  }

  closeMenu(): void {
    this.menuOpen.set(false);
  }

  logout(): void {
    this.auth.signOut();
    this.closeMenu();
  }
}
