import { Component, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { map, filter, exhaustMap, tap, catchError, finalize } from 'rxjs';
import { EMPTY } from 'rxjs';

import { LureFishSpeciesService } from '../../lure-fish-species-service';
import { Utilities } from '../../../../../core/utils/utilities';
import { LureFishSpecyViewModel } from '../../../../../core/view-models/lure-fish-specy-view-model';
import { Breadcrumb } from '../../../../../shared/breadcrumb/breadcrumb';
import { Loading } from '../../../../../shared/loading/loading';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
@Component({
  selector: 'app-lure-fish-species-detail',
  imports: [RouterLink,MatChipsModule,MatDividerModule,MatCardModule,MatIconModule,Breadcrumb,Loading],
  templateUrl: './lure-fish-species-detail.html',
  styleUrl: './lure-fish-species-detail.scss'
})
export class LureFishSpeciesDetail {
  private route = inject(ActivatedRoute);
  private svc = inject(LureFishSpeciesService);
  private utilities = inject(Utilities);

  vm = signal<LureFishSpecyViewModel | null>(null);
  loading = signal<boolean>(false);   // ← 本地 loading

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(pm => pm.get('id')),
      map(raw => raw === null ? NaN : Number(raw)),
      filter(id => Number.isFinite(id) && id > 0),

      // 单通道：上一请求未完成时忽略新触发（与你列表页一致）
      exhaustMap(id => {
        this.loading.set(true);  // ← 本地 loading 开始
        return this.svc.getLureFishSpeciesById(id).pipe(
          this.utilities.withGlobalLoading(),  // ← 全局 loading 接入
          tap(vm => {
            this.vm.set(vm); // 可能为 null（未找到）
          }),
          catchError(err => {
            console.error('getById error:', err);
            return EMPTY;
          }),
          finalize(() => this.loading.set(false)) // ← 本地 loading 结束
        );
      })
    ).subscribe();
  }
}
