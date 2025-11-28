import { Routes } from '@angular/router';
import { Login } from './features/authentication/pages/login/login';
import { NotFound } from './features/not-found/not-found';
import { Register } from './features/authentication/pages/register/register';
import { LureFishSpecies } from './features/lure/lure-fish-species/page/lure-fish-species/lure-fish-species';
import { requireAuthenticationGuard } from './core/services/require-authentication-guard';
import { LureFishSpeciesDetail } from './features/lure/lure-fish-species/page/lure-fish-species-detail/lure-fish-species-detail';
import { MainLayout } from './layouts/main-layout/main-layout';
import { requireAnonymousGuard } from './core/services/require-anonymous-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'lure/lure-fish-species', pathMatch: 'full' },
  { path: 'login', canActivate: [requireAnonymousGuard], component: Login },
  { path: 'register', canActivate: [requireAnonymousGuard], component: Register },
  {
    path: '',
    component: MainLayout,
    children: [
      { path: 'lure/lure-fish-species', canActivate: [requireAuthenticationGuard], component: LureFishSpecies },
      { path: 'lure/lure-fish-species/detail/:id', canActivate: [requireAuthenticationGuard], component: LureFishSpeciesDetail },
    ]
  },

  { path: '**', component: NotFound }
];
