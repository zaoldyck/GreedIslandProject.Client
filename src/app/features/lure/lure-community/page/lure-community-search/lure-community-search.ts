import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { TagViewModel } from '../../../../../core/view-models/tag-view-model';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Constants } from '../../../../../core/constants/constants';
import { catchError, combineLatest, debounce, debounceTime, distinctUntilChanged, finalize, forkJoin, map, merge, Observable, of, shareReplay, startWith, Subject, switchMap, take, timer } from 'rxjs';
import { LureCommunityCategoryViewModel } from '../../../../../core/view-models/lure-community-category-view-model';
import { LureCommunityService } from '../lure-community-service';
import { AsyncPipe } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonService } from '../../../../../core/services/common-service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { ApplicationUserViewModel } from '../../../../../core/view-models/application-user-view-model';
import { Utilities } from '../../../../../core/utils/utilities';
import { MatDatepickerModule } from '@angular/material/datepicker';
type SearchScope = 'topics' | 'categories' | 'users';
type HasId = { id: number };
export type PublishOp = 'lte' | 'gte'; // lte=早于，gte=晚于

@Component({
  selector: 'app-lure-community-search',
  imports: [MatDatepickerModule,MatSlideToggleModule, MatChipsModule,TranslocoModule,NgxMatSelectSearchModule, AsyncPipe,MatSelectModule, MatInputModule, MatIconModule, ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatCardModule],
  templateUrl: './lure-community-search.html',
  styleUrl: './lure-community-search.scss',
})
export class LureCommunitySearch {
  private fb = inject(FormBuilder);
  readonly constants = inject(Constants);
  private lureCommunityService = inject(LureCommunityService);
  private commonService = inject(CommonService);
  readonly Utilities = Utilities; 
  readonly MAX_SELECTED = 10;


  readonly compareById = <T extends HasId>(a: T | null, b: T | null): boolean =>
    a?.id === b?.id;
  readonly categories$: Observable<LureCommunityCategoryViewModel[]> =
    this.lureCommunityService.getLureCommunityCategories();
  readonly categorySearchCtrl = new FormControl<string>('', { nonNullable: true });
  // 过滤后的列表
  readonly filteredCategories$ = combineLatest([
    this.categories$,
    this.categorySearchCtrl.valueChanges.pipe(startWith('')),
  ]).pipe(
    map(([categories, keyword]) => {
      const k = keyword.trim().toLowerCase();
      if (!k) return categories;

      return categories.filter(c =>
        (c.name ?? '').toLowerCase().includes(k)
      );
    }),
    shareReplay(1)
  );
  clearCategorySearch() {
    this.categorySearchCtrl.setValue('');
  }

  readonly userSearchCtrl = new FormControl<string>('', { nonNullable: true });

  private readonly pageSize = 20;
 
  readonly userSearching = signal(false);
  readonly hasUserSearched = signal(false);
  private readonly forceClearUserSearch$ = new Subject<void>();

  readonly usersPage$ = merge(
    this.userSearchCtrl.valueChanges.pipe(map(raw => ({ raw, force: false }))),
    this.forceClearUserSearch$.pipe(map(() => ({ raw: this.userSearchCtrl.value, force: true }))) // ✅ 强制刷新事件
  ).pipe(
    startWith({ raw: this.userSearchCtrl.value, force: true }),

    // ✅ 正常输入防抖 250ms；强制刷新 0ms（立刻）
    debounce(e => timer(e.force ? 0 : 250)),

    // ✅ 仍然 trim（但不会再导致“无法强制刷新”）
    map(e => ({ ...e, keyword: e.raw.trim() })),

    // ✅ 只有在“非强制”时才去重；强制刷新永远放行
    distinctUntilChanged((a, b) => !b.force && a.keyword === b.keyword),

    switchMap(e => {
      const keyword = e.keyword;

      // === 你原来的逻辑几乎原封不动 ===
      if (!keyword) {
        this.userSearching.set(false);
        this.hasUserSearched.set(false); 
        const selected = this.form.controls.user.value; // ApplicationUserViewModel | null
        return of({
          items: selected ? [selected] : [],
          page: 1,
          pageSize: this.pageSize,
          totalCount: selected ? 1 : 0,
          totalPages: selected ? 1 : 0,
          hasNext: false,
          hasPrev: false
        });
      }

      this.userSearching.set(true);
      this.hasUserSearched.set(false);  
      return this.commonService.getUsersForDropdown({
        page: 1,
        pageSize: this.pageSize,
        keyword
      }).pipe(

        finalize(() => {
          this.userSearching.set(false);
          this.hasUserSearched.set(true);  // ✅ 关键：查询结束，才允许显示“无结果”
        }),

        catchError(() => {
          this.userSearching.set(false);
          this.hasUserSearched.set(true); 
          const selected = this.form.controls.user.value;
          return of({
            items: selected ? [selected] : [],
            page: 1,
            pageSize: this.pageSize,
            totalCount: selected ? 1 : 0,
            totalPages: selected ? 1 : 0,
            hasNext: false,
            hasPrev: false
          });
        })
      );
    }),

    shareReplay({ bufferSize: 1, refCount: true })
  );

 
  readonly filteredUsers$ = this.usersPage$.pipe(
    map(r => (r.items ?? []).map(u => {
      u.displayText = (u.displayName?.trim()) || u.userName || '';
      u.initials = Utilities.getInitials(u.displayText);
      return u;
    }))
  );
 


  clearUserSearch() {
    // 不需要靠 valueChanges 触发（它会被 distinct 吞），我们手动强制触发
    this.userSearchCtrl.setValue('', { emitEvent: false });

    // ✅ 关键：下一轮再触发，确保 mat-select 的值（比如你选了 null）已经写回 formControl
    queueMicrotask(() => this.forceClearUserSearch$.next());
  }



  private transloco = inject(TranslocoService);

  // 语言变化触发重算（确保初次也会 emit 一次）
  readonly lang$ = this.transloco.langChanges$.pipe(
    startWith(this.transloco.getActiveLang())
  );

  // 从后端拿到 TagTypes（全量：传 []）
  readonly tagTypes$ = this.commonService.getTagTypes([]).pipe(shareReplay(1));

  readonly tagSearchCtrl = new FormControl<string>('', { nonNullable: true });
 

  readonly filteredTagTypes$ = combineLatest([
    this.tagTypes$,
    this.tagSearchCtrl.valueChanges.pipe(startWith('')),
    this.lang$, // 语言切换触发重新过滤（因为 type 的翻译会变）
  ]).pipe(
    map(([types, keyword]) => {
      const k = (keyword ?? '').trim().toLowerCase();
      if (!k) return types;

      return types
        .map(t => {
          // ✅ type 名用于搜索 —— 翻译后参与匹配
          const typeLabel = (
            this.transloco.translate(t.name ?? '') || ''
          ).toLowerCase();
          const typeMatch = typeLabel.includes(k);
          const filteredTags = (t.tags ?? []).filter(tag =>
            (tag.name ?? '').toLowerCase().includes(k)
          );

          return {
            ...t,
            tags: typeMatch ? (t.tags ?? []) : filteredTags,
          };
        })
        .filter(t => (t.tags?.length ?? 0) > 0);
    }),
    shareReplay({ bufferSize: 1, refCount: true })
  );

 
  clearTagSearch() {
    this.tagSearchCtrl.setValue('');
  }
 


  form = this.fb.nonNullable.group({
    keyword: '',
    scope: this.fb.nonNullable.control<SearchScope>('topics'),

    category: this.fb.control<LureCommunityCategoryViewModel | null>(null),
    user: this.fb.control<ApplicationUserViewModel | null>(null),
    tags: this.fb.nonNullable.control<TagViewModel[]>([]),
    matchMode: 'AND',

    // ✅ 发布日期（保留下拉：早于/晚于），默认早于
    publishedOp: this.fb.nonNullable.control<PublishOp>('lte'),
    publishedDate: this.fb.control<Date | null>(null),
  });




  remove(tagId: number): void {
    this.tagSearchCtrl.setValue('');
    this.form.controls.tags.setValue(this.form.controls.tags.value.filter(t => t.id !== tagId));
  }

  onMatchModeChange(ev: MatSlideToggleChange) {
    this.form.controls.matchMode.setValue(ev.checked ? 'OR' : 'AND');
    this.onSearch();
  }
  // 快速链接折叠状态：默认展开（false 表示未折叠）
  readonly advancedOptionCollapsed = signal<boolean>(true);
  readonly postOptionCollapsed = signal<boolean>(false);
  /** 外部检索（自动重置并拉取） */
  onSearch() {
  }
  clearKeyword() {
    this.form.controls.keyword.setValue('');
  }
  toggleAdvancedOptions(): void {
    this.advancedOptionCollapsed.update(v => !v);
  }
  togglePostOptions(): void {
    this.postOptionCollapsed.update(v => !v);
  }
}
