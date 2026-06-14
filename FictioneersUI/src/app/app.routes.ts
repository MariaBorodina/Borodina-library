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
    path: 'books/new',
    canActivate: [authorGuard],
    loadComponent: () => import('./features/book-new/book-new.page').then((m) => m.BookNewPage),
  },
  {
    path: 'books/:id/read',
    loadComponent: () => import('./features/reading/reading.page').then((m) => m.ReadingPage),
  },
  {
    path: 'books/:id/edit',
    canActivate: [authorGuard],
    loadComponent: () => import('./features/book-edit/book-edit.page').then((m) => m.BookEditPage),
  },
  {
    path: 'books/:id/increments',
    canActivate: [authorGuard],
    loadComponent: () =>
      import('./features/book-increments/book-increments.page').then((m) => m.BookIncrementsPage),
  },
  {
    path: 'books/:id',
    loadComponent: () => import('./features/book-info/book-info.page').then((m) => m.BookInfoPage),
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
