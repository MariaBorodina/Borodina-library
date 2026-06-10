import { Routes } from '@angular/router';
import { authGuard, authorGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./features/home/home.page').then((m) => m.HomePage),
  },
  {
    path: 'realms',
    loadComponent: () =>
      import('./features/browse-realms/browse-realms.page').then((m) => m.BrowseRealmsPage),
  },
  {
    path: 'realms/:slug',
    loadComponent: () =>
      import('./features/realm-detail/realm-detail.page').then((m) => m.RealmDetailPage),
  },
  {
    path: 'search',
    loadComponent: () => import('./features/search/search.page').then((m) => m.SearchPage),
  },
  {
    path: 'authors',
    loadComponent: () => import('./features/authors/authors.page').then((m) => m.AuthorsPage),
  },
  {
    path: 'login',
    loadComponent: () => import('./features/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'my-books',
    canActivate: [authGuard],
    loadComponent: () => import('./features/my-books/my-books.page').then((m) => m.MyBooksPage),
  },
  {
    path: 'books-by-me',
    canActivate: [authorGuard],
    loadComponent: () =>
      import('./features/books-by-me/books-by-me.page').then((m) => m.BooksByMePage),
  },
];
