
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
  // ✅ 取消顶层 redirect（或保留，但更推荐别名方式）
  {
    path: '',
    component: MainLayout,
    children: [
      // ✅ 首页别名：让 '/' 直接显示 LureFishSpecies
      { path: '', component: LureFishSpecies },

      // ✅ 保留原路径：两个路径都能访问同一页面
      { path: 'lure/lure-fish-species', component: LureFishSpecies },

      { path: 'lure/lure-fish-species/detail/:id', canActivate: [requireAuthenticationGuard], component: LureFishSpeciesDetail },
    ]
  },

  { path: 'login', canActivate: [requireAnonymousGuard], component: Login },
  { path: 'register', canActivate: [requireAnonymousGuard], component: Register },
  { path: '**', component: NotFound }
];
