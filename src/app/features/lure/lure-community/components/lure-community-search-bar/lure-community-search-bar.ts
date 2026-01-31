import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';
import { combineLatest, map, Observable, shareReplay, startWith } from 'rxjs';
import { LureCommunityCategoryViewModel } from '../../../../../core/view-models/lure-community-category-view-model';
import { LureCommunityService } from '../../pages/lure-community-service';
import { MatSelectModule } from '@angular/material/select';
import { AsyncPipe } from '@angular/common';
import { NgxMatSelectSearchModule } from 'ngx-mat-select-search';
import { TranslocoModule, TranslocoService } from '@jsverse/transloco';
import { CommonService } from '../../../../../core/services/common-service';
import { TagViewModel } from '../../../../../core/view-models/tag-view-model';
type HasId = { id: number };
@Component({
  selector: 'app-lure-community-search-bar',
  imports: [TranslocoModule, NgxMatSelectSearchModule,AsyncPipe,MatSelectModule,MatButtonModule, ReactiveFormsModule, MatInputModule, MatIconModule, MatFormFieldModule,],
  templateUrl: './lure-community-search-bar.html',
  styleUrl: './lure-community-search-bar.scss',
})
export class LureCommunitySearchBar {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  private lureCommunityService = inject(LureCommunityService);
  private commonService = inject(CommonService);
  form = this.fb.nonNullable.group({
    keyword: ''
  });
  clearKeyword() {
    this.form.controls.keyword.setValue('');
    this.onSearch();
  }

  onSearch() {
    const keyword = (this.form.get('keyword')?.value ?? '').trim();

    this.router.navigate(['/lure/community/search'], {
      queryParams: {
        keyword,
        openAdvanced: '1'   // ⭐ 加这一行就够了
      }
    });
  }

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

  onCategorySelected(c: LureCommunityCategoryViewModel | null) {
    if (!c) return;

    // 你按你的路由规则改这行：
    this.router.navigate(['/lure/community/categories/detail', c.code]);
 
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
  onTagSelected(c: TagViewModel | null) {
    if (!c) return;

    // 你按你的路由规则改这行：
    this.router.navigate(['/lure/community/tags/detail', c.id]);

  }
  openAdvancedFilter() {
    // this.sidenav.open();
  }
}
