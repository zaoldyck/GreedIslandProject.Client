import { Injectable, signal, Signal } from '@angular/core';
import { HttpResponseBase, HttpResponse, HttpErrorResponse } from '@angular/common/http';
import { LureCommunityNavItem } from '../models/lure/lure-community-models';

@Injectable({ providedIn: 'root' })
export class Constants {
  public static readonly preferredProvinceIdKey = 'preferredProvinceId';

  readonly lureCommunityNav: LureCommunityNavItem[] = [
    { label: '交流区首页', icon: 'home', link: '/lure/community', exact: true },
    { label: '搜索', icon: 'search', link: '/lure/community/search', exact: false },
    { label: '最新话题', icon: 'chat', link: '/lure/community/latest', exact: false },
    { label: '热门话题', icon: 'star', link: '/lure/community/top', exact: false },
    { label: '我的书签', icon: 'bookmark', link: '/lure/community/bookmarks', exact: false },
  ];

  readonly lureCommunityMoreNav: LureCommunityNavItem[] = [
    { label: '关于交流区', icon: 'info', link: '/lure/community/about', exact: false },
    { label: '行为准则', icon: 'help', link: '/lure/community/code-of-conduct', exact: false },
    { label: '徽章', icon: 'badge', link: '/lure/community/badges', exact: false },
    { label: '用户', icon: 'group', link: '/lure/community/users', exact: false, queryParams: { order: 'likes_received' } },
    { label: '团队', icon: 'groups', link: '/lure/community/groups', exact: false },
    { label: '过滤', icon: 'filter_list', link: '/lure/community/filter', exact: false },
  ];

  readonly lureCommunityQuickLinks: LureCommunityNavItem[] = [
    { label: '装备评测', icon: 'rate_review', link: '/lure/community/categories/detail/gear-reviews', exact: false },
    { label: '全部主题', icon: 'list', link: '/lure/community/categories', exact: true }
  ];

}
