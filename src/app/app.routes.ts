// app.routes.ts
import { Routes } from '@angular/router';
import { Login } from './features/authentication/pages/login/login';
import { NotFound } from './features/not-found/not-found';
import { Register } from './features/authentication/pages/register/register';
import { LureFishSpecies } from './features/lure/lure-fish-species/page/lure-fish-species/lure-fish-species';
import { LureFishSpeciesDetail } from './features/lure/lure-fish-species/page/lure-fish-species-detail/lure-fish-species-detail';
import { MainLayout } from './layouts/main-layout/main-layout';
import { requireAnonymousGuard } from './core/services/require-anonymous-guard';
import { LureBaitTypes } from './features/lure/lure-bait-type/page/lure-bait-types/lure-bait-types';
import { LureBaitTypeDetail } from './features/lure/lure-bait-type/page/lure-bait-type-detail/lure-bait-type-detail';
import { LureCommunityHome } from './features/lure/lure-community/page/lure-community-home/lure-community-home';
import { LureCommunityShell } from './features/lure/lure-community/page/lure-community-shell/lure-community-shell';
import { LureCommunitySearch } from './features/lure/lure-community/page/lure-community-search/lure-community-search';
import { LureCommunityBookmarks } from './features/lure/lure-community/page/lure-community-bookmarks/lure-community-bookmarks';
import { LureCommunityLatest } from './features/lure/lure-community/page/lure-community-latest/lure-community-latest';
import { LureCommunityTop } from './features/lure/lure-community/page/lure-community-top/lure-community-top';

export const routes: Routes = [
  {
    path: '',
    component: MainLayout,
    data: { breadcrumb: null }, // 布局层不进面包屑
    children: [
      { path: '', component: LureFishSpecies, data: { breadcrumb: null } },

      // 分组层：lure（你可以改成 data: { breadcrumb: '路亚' } 来显示“路亚”这一级）
      {
        path: 'lure',
        data: { breadcrumb: null }, // 隐藏“路亚”这一级（需要显示就改成 '路亚'）
        children: [
          /** ----------------------------- 路亚鱼种 ----------------------------- **/
          {
            path: 'fish-species',
            data: { breadcrumb: '路亚鱼种' }, // 父 crumb
            children: [
              { path: '', component: LureFishSpecies }, // 列表（独立页面）
              {
                path: 'detail/:id',
                component: LureFishSpeciesDetail,
                data: { breadcrumb: '详情' },
                // 可选：显示真实标题
                // resolve: { title: LureFishSpeciesTitleResolver },
              },
            ],
          },

          /** ----------------------------- 拟饵类别 ----------------------------- **/
          {
            path: 'bait-types',
            // 这里你说模块名叫“拟饵”，如果你想在面包屑显示“拟饵”，也可以写成 '拟饵'
            data: { breadcrumb: '拟饵类别' }, // 父 crumb，或改成 '拟饵'
            children: [
              // 列表页（显示所有类别：minnow/vib/popper/...）
              { path: '', component: LureBaitTypes }, // 例如组件名：LureBaitTypesList

              // 详情页（某个类别详情，展示你定义的雷达图8维）
              {
                path: 'detail/:id',
                component: LureBaitTypeDetail,
                data: { breadcrumb: '详情' },
                // 可选：用 resolver 将 crumb 改为该类别的中文名，如“米诺”
                // resolve: { title: LureBaitTypeTitleResolver },
              },
            ],
          },
          {
            path: 'community',
            component:LureCommunityShell,
            data: { breadcrumb: '交流区', showCommunityMenuButton: true },
            children: [
              { path: '', component: LureCommunityHome },
              { path: 'search', component: LureCommunitySearch },
              { path: 'latest', component: LureCommunityLatest },
              { path: 'top', component: LureCommunityTop },
              { path: 'bookmarks', component: LureCommunityBookmarks },
              {
                path: 'detail/:id',
                component: LureBaitTypeDetail,
                data: { breadcrumb: '详情' },
              },
            ],
          },
        ],
      },
    ],
  },

  // 登录/注册：不进面包屑
  { path: 'login', canActivate: [requireAnonymousGuard], component: Login, data: { breadcrumb: null } },
  { path: 'register', canActivate: [requireAnonymousGuard], component: Register, data: { breadcrumb: null } },

  // 404
  { path: '**', component: NotFound, data: { breadcrumb: '未找到' } },
];
