import { Routes } from '@angular/router';

export const routes: Routes = [
  { path: '', loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'search', loadComponent: () => import('./features/search/search.component').then(m => m.SearchComponent) },
  { path: 'artist/:id', loadComponent: () => import('./features/artist/artist.component').then(m => m.ArtistComponent) },
  { path: 'release/:id', loadComponent: () => import('./features/release/release.component').then(m => m.ReleaseComponent) },
  { path: 'listen', loadComponent: () => import('./features/listen/listen.component').then(m => m.ListenComponent) },
  { path: 'favorites', loadComponent: () => import('./features/favorites/favorites.component').then(m => m.FavoritesComponent) },
  { path: '**', redirectTo: '' },
];
