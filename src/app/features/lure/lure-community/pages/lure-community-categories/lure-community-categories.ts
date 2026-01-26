import { Component, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LureBaitTypeService } from '../../../lure-bait-type/lure-bait-type-service';
import { CommonService } from '../../../../../core/services/common-service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Utilities } from '../../../../../core/utils/utilities';
import { EMPTY, exhaustMap, Subject, takeUntil, tap } from 'rxjs';
import { LureBaitTypeViewModel } from '../../../../../core/view-models/lure-bait-type-view-model';
import { PagedResult } from '../../../../../core/models/common-models';
import { TagViewModel } from '../../../../../core/view-models/tag-view-model';
import { LureBaitTypeSearchRequest } from '../../../../../core/models/lure/lure-bait-type-models';
import { TagSelectDialog } from '../../../../../shared/tag-select-dialog/tag-select-dialog';
import { MatchMode, TagSelectDialogData, TagSelectResult } from '../../../../../shared/tag-select-dialog/tag-select-dialog-data';
import { Location } from '@angular/common';
import { LureFishCommunitySearchBar } from '../../components/lure-fish-community-search-bar/lure-fish-community-search-bar';
@Component({
  selector: 'app-lure-community-categories',
  imports: [LureFishCommunitySearchBar,MatSlideToggleModule, MatButtonModule, ReactiveFormsModule, MatInputModule, MatChipsModule, MatIconModule, MatFormFieldModule, MatAutocompleteModule, MatProgressSpinnerModule, MatRippleModule, MatListModule, MatCardModule],
  templateUrl: './lure-community-categories.html',
  styleUrl: './lure-community-categories.scss',
})
export class LureCommunityCategories {
  private svc = inject(LureBaitTypeService);
  private commonService = inject(CommonService);
  private router = inject(Router);
  private location = inject(Location);

  private dialog = inject(MatDialog);
  private utilities = inject(Utilities);
  private el = inject(ElementRef<HTMLElement>);
  private readonly currentModuleCode = "LUREBAITTYPE";
  /** —— RxJS：唯一触发入口 + 生命周期清理 —— */
  private nextPage$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  /** —— signals：本地状态 —— */
  readonly items = signal<LureBaitTypeViewModel[]>([]);
  readonly isLoading = signal(false);
  readonly noMore = signal(false);

  /** 分页（1-based）与搜索条件 */
  readonly page = signal(1);
  readonly pageSize = signal(20);

  /** 最近一次响应（如需显示 totalCount/totalPages） */
  readonly lastResult = signal<PagedResult<LureBaitTypeViewModel> | null>(null);

  /** IO（自动触发用） */
  private io?: IntersectionObserver;

  /** 记录当前正在观察的锚点元素，便于切换时取消观察 */
  private anchorEl?: Element | null;



  ngOnInit(): void {
 

   
  
  }
 
 

  /**
   * 观察“倒数第4张卡片”作为预加载锚点。
   * 列表不足4条时，退化为观察第0张（最后一张）。
   * 幂等：切换锚点前会取消旧观察；仅在元素为有效 Element 且仍连接到文档时观察。
   */
  private observePreloadAnchor() {
    // IO 未初始化直接返回
    if (!this.io) return;

    // 找到当前的卡片列表
    const cards = this.el.nativeElement.querySelectorAll('.card-list .app-card');

    // 列表为空，取消旧观察后退出
    if (!cards || cards.length === 0) {
      this.unobserveCurrentAnchor();
      return;
    }

    // 计算倒数第5张（不足则0）
    const idx = Math.max(0, cards.length - 5);
    const candidate = cards.item(idx);

    // 确认 candidate 是 Element
    if (!(candidate instanceof Element)) {
      this.unobserveCurrentAnchor();
      return;
    }

    // 若锚点变化，先取消观察旧锚点
    if (this.anchorEl && this.anchorEl !== candidate) {
      try { this.io.unobserve(this.anchorEl); } catch { }
    }

    // 记录新锚点
    this.anchorEl = candidate;

    // 等一帧，确保元素已挂载/布局稳定
    requestAnimationFrame(() => {
      const io = this.io;
      const anchor = this.anchorEl;

      // 再次判空（防止这一帧内被重置）
      if (!io || !anchor) return;

      // 确认元素仍在文档中
      const isConnected =
        (anchor as any).isConnected ??
        this.el.nativeElement.contains(anchor);

      if (!isConnected) {
        this.unobserveCurrentAnchor();
        return;
      }

      try {
        io.observe(anchor); // 这里 anchor 已被 TS 收窄为 Element
      } catch (err) {
        this.unobserveCurrentAnchor();
      }
    });
  }

  /** 取消当前锚点的观察（可选工具方法） */
  private unobserveCurrentAnchor() {
    if (this.anchorEl) {
      try { this.io?.unobserve(this.anchorEl); } catch { }
      this.anchorEl = null;
    }
  }

  /** 重置并拉取第 1 页（自动） */
  private resetAndLoadFirstPage() {
    this.items.set([]);
    this.noMore.set(false);
    this.isLoading.set(false);

    this.page.set(1);
    this.pageSize.set(20);

    // 初次渲染通常没有锚点；首屏完成后会自动设置锚点
    this.unobserveCurrentAnchor();

    // 下一帧滚到顶部（更稳），再触发首屏请求
    requestAnimationFrame(() => {
      this.commonService.scrollToTop('smooth');  // 或 'smooth'
      this.nextPage$.next();
    });
  }

  /** 外部检索（自动重置并拉取） */
  onSearch() {
    this.resetAndLoadFirstPage();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.io?.disconnect();
  }
 
 
  /** 图片工具（保持你的逻辑） */
  private fallbackImage = 'placeholder-fish.svg';
  resolveImageUrl(url?: string | null): string {
    const u = (url ?? '').trim();
    return u.length > 0 ? u : this.fallbackImage;
  }
  onImgError(evt: Event) {
    const img = evt.target as HTMLImageElement;
    if (!img.src.endsWith(this.fallbackImage)) {
      img.src = this.fallbackImage;
      img.classList.add('is-fallback');
    }
  }
  onImgLoad(evt: Event) {
    const card = (evt.target as HTMLImageElement).closest('.app-card');
    card?.querySelector('.img-skeleton')?.remove();
  }
}

