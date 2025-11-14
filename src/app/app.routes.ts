import { Routes } from '@angular/router';
import { Login } from './features/authentication/pages/login/login';
import { NotFound } from './features/not-found/not-found';
import { Register } from './features/authentication/pages/register/register';
import { LureFishSpecies } from './features/lure/lure-fish-species/page/lure-fish-species/lure-fish-species';
import { requireAuthenticationGuard } from './core/services/require-authentication-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/lure/lure-fish-species', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'register', component: Register },
  { path: 'lure/lure-fish-species', canActivate: [requireAuthenticationGuard], component: LureFishSpecies },
  { path: '**', component: NotFound }
];
