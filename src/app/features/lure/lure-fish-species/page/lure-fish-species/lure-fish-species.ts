// lure-fish-species.component.ts
import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule, NgOptimizedImage } from '@angular/common';
import { Observable } from 'rxjs';
import { LureFishSpeciesService } from '../../lure-fish-species-service';
import { PagedResult } from '../../../../../core/models/common-models';
import { LureFishSpecyViewModel } from '../../../../../core/view-models/lure-fish-specy-view-model';
import { LureFishSpeciesSearchRequest } from '../../../../../core/models/lure/lure-fish-species-models';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatRippleModule } from '@angular/material/core';
import { Utilities } from '../../../../../core/utils/utilities';
@Component({
  selector: 'app-lure-fish-species',
  standalone: true,
  imports: [ MatRippleModule,AsyncPipe, MatListModule, MatCardModule],
  templateUrl: './lure-fish-species.html',
  styleUrls: ['./lure-fish-species.scss']
})
export class LureFishSpecies {
  private svc = inject(LureFishSpeciesService);
  private utilities = inject(Utilities);
  // 用 Observable 供模板 async 管道订阅
  result$!: Observable<PagedResult<LureFishSpecyViewModel>>;
  private fallbackImage = 'placeholder-fish.svg';
  ngOnInit(): void {
    const req: LureFishSpeciesSearchRequest = {
      keyword: '',
      page: 1,
      pageSize: 20,
      // 视你的模型再补充其它筛选字段
    };
    this.result$ = this.svc.search(req).pipe(
      this.utilities.withGlobalLoading() // ✅ 再次搜索同样包裹
    );
  }

  // 如果需要手动触发搜索
  onSearch(req: LureFishSpeciesSearchRequest) {
    this.result$ = this.svc.search(req)
      .pipe(
        this.utilities.withGlobalLoading() // ✅ 再次搜索同样包裹
      );
;
  }


  resolveImageUrl(url?: string | null): string {
    const u = (url ?? '').trim();
    return u.length > 0 ? u : this.fallbackImage;
  }

  /** 图片加载失败时替换为占位图（防止循环） */
  onImgError(evt: Event) {
    const img = evt.target as HTMLImageElement;
    if (!img.src.endsWith(this.fallbackImage)) {
      img.src = this.fallbackImage;
      img.classList.add('is-fallback'); // 可选：加样式弱化
    }
  }

  /** 加载完成后（可选）移除骨架或做样式调整 */
  onImgLoad(evt: Event) {
    const card = (evt.target as HTMLImageElement).closest('.fish-card');
    card?.querySelector('.img-skeleton')?.remove();
  }

}
