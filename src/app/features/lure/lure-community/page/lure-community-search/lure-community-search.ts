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
import { combineLatest, forkJoin, map, Observable, of, shareReplay, startWith, switchMap, take } from 'rxjs';
import { LureCommunityCategoryViewModel } from '../../../../../core/view-models/lure-community-category-view-model';
import { LureCommunityService } from '../lure-community-service';
import { AsyncPipe } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { CommonService } from '../../../../../core/services/common-service';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { MatChipsModule } from '@angular/material/chips';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';

type SearchScope = 'topics' | 'categories' | 'users';
type HasId = { id: number };
@Component({
  selector: 'app-lure-community-search',
  imports: [MatSlideToggleModule, MatChipsModule,TranslocoModule,NgxMatSelectSearchModule, AsyncPipe,MatSelectModule, MatInputModule, MatIconModule, ReactiveFormsModule, MatFormFieldModule, MatButtonModule, MatCardModule],
  templateUrl: './lure-community-search.html',
  styleUrl: './lure-community-search.scss',
})
export class LureCommunitySearch {
  private fb = inject(FormBuilder);
  readonly constants = inject(Constants);
  private lureCommunityService = inject(LureCommunityService);
  private commonService = inject(CommonService);
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

  readonly compareById = <T extends HasId>(a: T | null, b: T | null): boolean =>
    a?.id === b?.id;

  clearCategorySearch() {
    this.categorySearchCtrl.setValue('');
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

    tags: this.fb.nonNullable.control<TagViewModel[]>([]),
    matchMode: 'AND', // ✅ 用字面量类型，默认 OR
  });

  remove(tagId: number): void {
    const tagsCtrl = this.form.controls.tags;     // ✅ 强类型 FormControl<TagViewModel[]>
    const current = tagsCtrl.value;               // ✅ 一定是 TagViewModel[]（nonNullable）

    // 如果没有变化就不 setValue（避免无意义触发 valueChanges）
    const next = current.filter(t => t.id !== tagId);
    if (next.length === current.length) return;

    tagsCtrl.setValue(next);

 
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
