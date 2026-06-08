import { Routes } from '@angular/router';

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
];
