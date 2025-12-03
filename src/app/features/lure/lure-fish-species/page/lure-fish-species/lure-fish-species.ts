// lure-fish-species.component.ts
import { Component, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { Observable } from 'rxjs';
import { LureFishSpeciesService } from '../../lure-fish-species-service';
import { PagedResult } from '../../../../../core/models/common-models';
import { LureFishSpecyViewModel } from '../../../../../core/view-models/lure-fish-specy-view-model';
import { LureFishSpeciesSearchRequest } from '../../../../../core/models/lure/lure-fish-species-models';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';

@Component({
  selector: 'app-lure-fish-species',
  standalone: true,
  imports: [AsyncPipe, MatListModule, MatCardModule],
  templateUrl: './lure-fish-species.html',
  styleUrls: ['./lure-fish-species.scss']
})
export class LureFishSpecies {
  private svc = inject(LureFishSpeciesService);

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
    this.result$ = this.svc.search(req);
  }

  // 如果需要手动触发搜索
  onSearch(req: LureFishSpeciesSearchRequest) {
    this.result$ = this.svc.search(req);
  }

  resolveImageUrl(url?: string | null): string {
    return url && url.trim().length > 0 ? url : this.fallbackImage;
  }

  /** 图片加载失败时替换为占位图 */
  onImgError(evt: Event) {
    (evt.target as HTMLImageElement).src = this.fallbackImage;
  }
}
