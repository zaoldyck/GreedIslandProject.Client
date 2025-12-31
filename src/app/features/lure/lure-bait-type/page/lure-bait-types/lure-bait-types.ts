import { Component, ElementRef, inject, signal } from '@angular/core';
 
import { CommonService } from '../../../../../core/services/common-service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Utilities } from '../../../../../core/utils/utilities';
import { EMPTY, exhaustMap, Subject, takeUntil, tap } from 'rxjs';
 
import { PagedResult } from '../../../../../core/models/common-models';
import { TagViewModel } from '../../../../../core/view-models/tag-view-model';
 
import { TagSelectDialog } from '../../../../../shared/tag-select-dialog/tag-select-dialog';
import { MatchMode, TagSelectDialogData, TagSelectResult } from '../../../../../shared/tag-select-dialog/tag-select-dialog-data';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { LureBaitTypeService } from '../../lure-bait-type-service';
import { LureBaitTypeSearchRequest } from '../../../../../core/models/lure/lure-bait-type-models';
import { LureBaitTypeViewModel } from '../../../../../core/view-models/lure-bait-type-view-model';
import { Location } from '@angular/common';

@Component({
  selector: 'app-lure-bait-types',
  imports: [MatSlideToggleModule, MatButtonModule, ReactiveFormsModule, MatInputModule, MatChipsModule, MatIconModule, MatFormFieldModule, MatAutocompleteModule, MatProgressSpinnerModule, MatRippleModule, MatListModule, MatCardModule],
  templateUrl: './lure-bait-types.html',
  styleUrl: './lure-bait-types.scss',
})
export class LureBaitTypes {
  private svc = inject(LureBaitTypeService);
  private commonService = inject(CommonService);
  private router = inject(Router);
  private location = inject(Location);
  private fb = inject(FormBuilder);
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

  form = this.fb.nonNullable.group({
    keyword: '',
    tags: this.fb.nonNullable.control<TagViewModel[]>([]),
    matchMode: 'AND', // ✅ 用字面量类型，默认 OR
  });

  ngOnInit(): void {
    // 1) 初始化 IntersectionObserver（你的方法）
    this.initIntersectionObserver();

    // 2) 建立搜索管道：就是你原来 this.nextPage$.pipe(...).subscribe() 那段
    this.setupSearchPipeline();

    // 3) 读取浏览器历史条目的 state，判断是否来自详情页
    const st = history.state as {
      from?: string;
      keyword?: string;
      tags?: TagViewModel[];
      matchMode?: 'AND' | 'OR';
    };
    const fromDetail = st?.from === '/lure/lure-bait-types';

    if (fromDetail) {
      // —— 恢复筛选条件（仅在从详情返回时）——
      this.form.controls.keyword.setValue(st.keyword ?? '');
      this.form.controls.tags.setValue(st.tags ?? []);
      this.form.controls.matchMode.setValue(st.matchMode ?? 'AND');

      // （可选）恢复分页：
      // this.page.set(st.page ?? 1);
      // this.pageSize.set(st.pageSize ?? 20);

      // 清空并按当前条件拉首屏
      this.items.set([]);
      this.noMore.set(false);
      this.isLoading.set(false);
      this.unobserveCurrentAnchor();

      // 下一帧：恢复滚动位置（可选）+ 触发首屏请求
      requestAnimationFrame(() => {

        this.commonService.scrollToTop('auto');

        this.nextPage$.next();
      });

      // ✅ 关键：用完即清空当前历史条目的 state，避免刷新或再次返回误恢复
      if (typeof window !== 'undefined' && 'replaceState' in window.history) {
        window.history.replaceState({}, '', window.location.pathname + window.location.search + window.location.hash);
      }
    } else {
      // 非详情返回（例如菜单/外链进入），按初始流程清空并拉取第 1 页
      this.resetAndLoadFirstPage();
    }
  }


  private setupSearchPipeline() {
    this.nextPage$
      .pipe(
        exhaustMap(() => {
          if (this.isLoading() || this.noMore()) return EMPTY;
          this.isLoading.set(true);

          const keyword = this.form.controls.keyword.value.trim() || undefined;
          const tagIds = (this.form.controls.tags.value ?? []).map(t => t.id);
          const effectiveTagIds = tagIds.length ? tagIds : undefined;

          const req: LureBaitTypeSearchRequest = {
            keyword,                                  // ✅ 关键字（undefined 代表不筛）
            tagIds: effectiveTagIds,                  // ✅ 标签id（undefined 代表不筛）
            matchMode: this.form.controls.matchMode.value, // ✅ 'AND' | 'OR' 作为 string 传
            page: this.page(),                        // 1-based
            pageSize: this.pageSize(),
          };

          return this.svc.search(req).pipe(
            this.utilities.withGlobalLoading(),
            tap({
              next: (pr) => {
                // 累加并按 id 去重
                const prev = this.items();
                const incoming = pr.items ?? [];
                const byId = new Map<string | number, LureBaitTypeViewModel>();
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
  }

  clearKeyword() {
    this.form.controls.keyword.setValue('');
    this.onSearch();
  }

  reset() {
    this.form.reset();
    this.onSearch();
  }

  removeTag(tag: TagViewModel) {
    const current = this.form.controls.tags.value;
    this.form.controls.tags.setValue(current.filter(t => t.id !== tag.id));
    this.onSearch();
  }



  openTagSelectDialog(): void {
    // 从表单里拿当前已选的标签和匹配模式
    const currentTags: TagViewModel[] = this.form.controls.tags.value ?? [];
    const currentMatchMode = (this.form.controls.matchMode?.value ?? 'AND') as MatchMode;

    const ref = this.dialog.open<TagSelectDialog, TagSelectDialogData, TagSelectResult>(
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
          matchMode: currentMatchMode,            // ✅ 传入当前模式
        },
        autoFocus: false,
        restoreFocus: true,
        // disableClose: false, // 是否允许点击遮罩关闭，按你的需求
      }
    );

    ref.afterClosed().subscribe((result?: TagSelectResult) => {
      if (!result) return;

      // 写回 form：tags + matchMode
      this.form.controls.tags.setValue(result.tags);
      if (this.form.controls.matchMode) {
        this.form.controls.matchMode.setValue(result.matchMode);
      }
      this.onSearch();
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



  onOpenDetail(id: number) {
    // 1) 写入当前列表页的历史条目 state（不导航）
    const restoreState = {
      from: '/lure/lure-bait-types',
      keyword: this.form.controls.keyword.value ?? '',
      tags: (this.form.controls.tags.value ?? []).map(t => ({ id: t.id, name: t.name, typeColor: t.typeColor })), // 建议降维成可序列化的轻量对象
      matchMode: (this.form.controls.matchMode.value ?? 'AND') as 'AND' | 'OR'
    };

    // 注意：第三个参数是 state；第二个参数是 query string（通常传空）
    this.location.replaceState(this.router.url, '', restoreState);

    // 2) 导航到详情页（如需可传入简短的 from）
    this.router.navigate(['/lure/lure-bait-types/detail', id], {
      state: { from: '/lure/lure-bait-types' }
    });
  }


  onMatchModeChange(ev: MatSlideToggleChange) {
    this.form.controls.matchMode.setValue(ev.checked ? 'OR' : 'AND');
    this.onSearch();
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
