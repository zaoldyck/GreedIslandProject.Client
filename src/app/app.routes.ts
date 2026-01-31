// app.routes.ts
import { Routes } from '@angular/router';
import { Login } from './features/authentication/pages/login/login';
import { NotFound } from './features/not-found/not-found';
import { Register } from './features/authentication/pages/register/register';
import { LureFishSpecies } from './features/lure/lure-fish-species/pages/lure-fish-species/lure-fish-species';
import { LureFishSpeciesDetail } from './features/lure/lure-fish-species/pages/lure-fish-species-detail/lure-fish-species-detail';
import { MainLayout } from './layouts/main-layout/main-layout';
import { requireAnonymousGuard } from './core/services/require-anonymous-guard';
import { LureBaitTypes } from './features/lure/lure-bait-type/pages/lure-bait-types/lure-bait-types';
import { LureBaitTypeDetail } from './features/lure/lure-bait-type/pages/lure-bait-type-detail/lure-bait-type-detail';
import { LureCommunityShell } from './features/lure/lure-community/pages/lure-community-shell/lure-community-shell';
import { LureCommunitySearch } from './features/lure/lure-community/pages/lure-community-search/lure-community-search';
import { LureCommunityBookmarks } from './features/lure/lure-community/pages/lure-community-bookmarks/lure-community-bookmarks';
import { LureCommunityLatest } from './features/lure/lure-community/pages/lure-community-latest/lure-community-latest';
import { LureCommunityTop } from './features/lure/lure-community/pages/lure-community-top/lure-community-top';
import { LureCommunityAbout } from './features/lure/lure-community/pages/lure-community-about/lure-community-about';
import { LureCommunityCodeOfConduct } from './features/lure/lure-community/pages/lure-community-code-of-conduct/lure-community-code-of-conduct';
import { LureCommunityBadges } from './features/lure/lure-community/pages/lure-community-badges/lure-community-badges';
import { LureCommunityUsers } from './features/lure/lure-community/pages/lure-community-users/lure-community-users';
import { LureCommunityGroups } from './features/lure/lure-community/pages/lure-community-groups/lure-community-groups';
import { LureCommunityFilter } from './features/lure/lure-community/pages/lure-community-filter/lure-community-filter';
import { LureCommunityCategories } from './features/lure/lure-community/pages/lure-community-categories/lure-community-categories';
import { LureCommunityCategoryDetail } from './features/lure/lure-community/pages/lure-community-category-detail/lure-community-category-detail';
import { LureCommunityTags } from './features/lure/lure-community/pages/lure-community-tags/lure-community-tags';
import { LureCommunityTagDetail } from './features/lure/lure-community/pages/lure-community-tag-detail/lure-community-tag-detail';
import { LureCommunityMyMessages } from './features/lure/lure-community/pages/lure-community-my-messages/lure-community-my-messages';
import { LureCommunityMyActivities } from './features/lure/lure-community/pages/lure-community-my-activities/lure-community-my-activities';

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
            component: LureCommunityShell,
            data: { breadcrumb: '交流区', showCommunityMenuButton: true },
            children: [
              { path: '', component: LureCommunityTop, data: { breadcrumb: '交流区首页' } },
              { path: 'search', component: LureCommunitySearch, data: { breadcrumb: '搜索' } },
              { path: 'latest', component: LureCommunityLatest, data: { breadcrumb: '最新话题' } },
              { path: 'top', component: LureCommunityTop, data: { breadcrumb: '热门话题' } },
              { path: 'my-activities', component: LureCommunityMyActivities, data: { breadcrumb: '我的动态' } },
              { path: 'my-messages', component: LureCommunityMyMessages, data: { breadcrumb: '我的消息' } },
              { path: 'bookmarks', component: LureCommunityBookmarks, data: { breadcrumb: '我的书签' } },
              { path: 'about', component: LureCommunityAbout, data: { breadcrumb: '关于交流区' } },
              { path: 'code-of-conduct', component: LureCommunityCodeOfConduct, data: { breadcrumb: '行为准则' } },
              { path: 'badges', component: LureCommunityBadges, data: { breadcrumb: '徽章' } },
              { path: 'users', component: LureCommunityUsers, data: { breadcrumb: '用户' } },
              { path: 'groups', component: LureCommunityGroups, data: { breadcrumb: '团队' } },
              { path: 'filter', component: LureCommunityFilter, data: { breadcrumb: '过滤' } },
              {
                path: 'categories',

                data: { breadcrumb: '全部主题' },
                children: [

                  {
                    path: '', component: LureCommunityCategories,
                    data: { breadcrumb: null }
                  },

                  {
                    path: 'detail/:code',
                    component: LureCommunityCategoryDetail,
                    data: { breadcrumb: '详情' },
                  },
                ],
              },
              {
                path: 'tags',

                data: { breadcrumb: '全部标签' },
                children: [

                  {
                    path: '', component: LureCommunityTags,
                    data: { breadcrumb: null }
                  },

                  {
                    path: 'detail/:id',
                    component: LureCommunityTagDetail,
                    data: { breadcrumb: '详情' },
                  },
                ],
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
