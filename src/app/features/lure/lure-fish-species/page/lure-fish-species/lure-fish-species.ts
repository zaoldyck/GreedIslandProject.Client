import { Component, inject, signal, ElementRef } from '@angular/core';
import { EMPTY, Subject } from 'rxjs';
import { exhaustMap, tap, takeUntil } from 'rxjs/operators';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';

import { LureFishSpeciesService } from '../../lure-fish-species-service';
import { PagedResult } from '../../../../../core/models/common-models';
import { LureFishSpecyViewModel } from '../../../../../core/view-models/lure-fish-specy-view-model';
import { LureFishSpeciesSearchRequest } from '../../../../../core/models/lure/lure-fish-species-models';
import { Utilities } from '../../../../../core/utils/utilities';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterLink } from '@angular/router';
import { CommonService } from '../../../../../core/services/common-service';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatInputModule } from '@angular/material/input';
import { TagTypeViewModel } from '../../../../../core/view-models/tag-type-view-model';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { TagViewModel } from '../../../../../core/view-models/tag-view-model';
import { MatDialog } from '@angular/material/dialog';
import { TagSelectDialog } from '../../../../../shared/tag-select-dialog/tag-select-dialog';
import { TagSelectDialogData } from '../../../../../shared/tag-select-dialog/tag-select-dialog-data';
@Component({
  selector: 'app-lure-fish-species',
  standalone: true,
  imports: [MatButtonModule, ReactiveFormsModule, MatInputModule, MatChipsModule, MatIconModule, MatFormFieldModule, MatAutocompleteModule, RouterLink, MatProgressSpinnerModule, MatRippleModule, MatListModule, MatCardModule],
  templateUrl: './lure-fish-species.html',
  styleUrls: ['./lure-fish-species.scss']
})
export class LureFishSpecies {
  private svc = inject(LureFishSpeciesService);
  private fb = inject(FormBuilder);
  private dialog = inject(MatDialog);
  private utilities = inject(Utilities);
  private el = inject(ElementRef<HTMLElement>);
  private readonly currentModuleCode = "LUREFISHSPECIES";
  /** —— RxJS：唯一触发入口 + 生命周期清理 —— */
  private nextPage$ = new Subject<void>();
  private destroy$ = new Subject<void>();

  /** —— signals：本地状态 —— */
  readonly items = signal<LureFishSpecyViewModel[]>([]);
  readonly isLoading = signal(false);
  readonly noMore = signal(false);

  /** 分页（1-based）与搜索条件 */
  readonly page = signal(1);
  readonly pageSize = signal(20);
  readonly keyword = signal('');

  /** 最近一次响应（如需显示 totalCount/totalPages） */
  readonly lastResult = signal<PagedResult<LureFishSpecyViewModel> | null>(null);

  /** IO（自动触发用） */
  private io?: IntersectionObserver;

  /** 记录当前正在观察的锚点元素，便于切换时取消观察 */
  private anchorEl?: Element | null;

  form = this.fb.nonNullable.group({
    keyword: '',
    tags: this.fb.nonNullable.control<TagViewModel[]>([]),
    tagMatchAll: true,
  });

  ngOnInit(): void {
    // 单通道：上一请求未完成时忽略新触发（防并发、稳边界）
    this.nextPage$
      .pipe(
        exhaustMap(() => {
          if (this.isLoading() || this.noMore()) return EMPTY;
          this.isLoading.set(true);

          const req: LureFishSpeciesSearchRequest = {
            keyword: this.keyword(),
            page: this.page(),        // 1-based
            pageSize: this.pageSize(),
          };

          return this.svc.search(req).pipe(
            this.utilities.withGlobalLoading(),
            tap({
              next: (pr) => {
                // 累加并按 id 去重
                const prev = this.items();
                const incoming = pr.items ?? [];
                const byId = new Map<string | number, LureFishSpecyViewModel>();
                for (const it of prev) byId.set(it.id, it);
                for (const it of incoming) byId.set(it.id, it);
                this.items.set(Array.from(byId.values()));

                this.lastResult.set(pr);

                // —— 边界判定（优先后端字段，兼容 camelCase / PascalCase） —— //
                const hasNext = (pr as any).hasNext ?? (pr as any).HasNext;
                const totalPages = (pr as any).totalPages ?? (pr as any).TotalPages;
                const totalCount = (pr as any).totalCount ?? (pr as any).TotalCount;

                if (hasNext !== undefined) {
                  this.noMore.set(!hasNext);
                } else if (totalPages !== undefined) {
                  this.noMore.set(pr.page >= totalPages);
                } else if (totalCount !== undefined) {
                  this.noMore.set(pr.page * pr.pageSize >= totalCount);
                } else {
                  // 兜底：不足一页视为没有更多
                  this.noMore.set(incoming.length < pr.pageSize);
                }

                // 有更多则页码 +1（1-based）
                if (!this.noMore()) {
                  this.page.set(pr.page + 1);
                }

                // 数据渲染后观察“倒数第4张卡片”为锚点（宏任务，视图更稳定）
                requestAnimationFrame(() => this.observePreloadAnchor());
              },
              error: (err) => {
                console.error('search error:', err);
              },
              complete: () => {
                this.isLoading.set(false);
              }
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    // 初始化 IO 并触发首屏
    this.initIntersectionObserver();
    this.resetAndLoadFirstPage();
  }

  clearKeyword() {
    this.form.controls.keyword.setValue('');
  }

  reset() {
    this.form.reset();
  }

  removeTag(tag: TagViewModel) {
    const current = this.form.controls.tags.value;
    this.form.controls.tags.setValue(current.filter(t => t.id !== tag.id));
  }


  openTagSelectDialog(): void {
    // 从表单里拿当前已选的标签对象数组
    const currentTags: TagViewModel[] = this.form.controls.tags.value ?? [];

    const ref = this.dialog.open<TagSelectDialog, TagSelectDialogData, TagViewModel[]>(
      TagSelectDialog,
      {
        width: 'min(720px, 90dvw)',
        maxWidth: '90dvw',
        minHeight: '50dvh',
        maxHeight: '90dvh',
        data: {
          selectedIds: currentTags.map(t => t.id), // ✅ 只传 id
          title: '选择标签',
          allowMultiple: true,
          moduleCode: this.currentModuleCode,
        },
        autoFocus: false,
        restoreFocus: true,
      }
    );

    ref.afterClosed().subscribe((result?: TagViewModel[]) => {
      if (result) {
        this.form.controls.tags.setValue(result); // ✅ 弹窗返回对象数组
        this.onSearch();
      }
    });
  }


  /** 自动无限加载：初始化 IO */
  private initIntersectionObserver() {
    this.io?.disconnect();

    // 如果你使用“内层滚动容器”，把 root 换成那个容器元素，并确保容器有固定高度 + overflow:auto
    const rootEl: Element | null = null; // 视口作为 root；如需内层容器：this.el.nativeElement.querySelector('.scroll-container')

    this.io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting && !this.isLoading() && !this.noMore()) {
            this.nextPage$.next(); // 自动触发下一页
          }
        }
      },
      {
        root: rootEl,
        // 可以视需要调整预加载提前量；倒数第4张通常不需要太大的提前量
        rootMargin: '0px',
        threshold: 0.01
      }
    );

    // 首次尝试观察（视图可能未稳定，稍后也会在请求完成后再次观察）
    requestAnimationFrame(() => this.observePreloadAnchor());
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
    this.nextPage$.next(); // 自动首屏
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
