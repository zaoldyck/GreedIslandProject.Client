import { Component, inject, signal } from '@angular/core';
import { Breadcrumb } from '../../../../../shared/breadcrumb/breadcrumb';
import { Loading } from '../../../../../shared/loading/loading';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute, RouterLink } from '@angular/router';
 
import { Utilities } from '../../../../../core/utils/utilities';
 
import { catchError, EMPTY, exhaustMap, filter, finalize, map, tap } from 'rxjs';
import { LureBaitTypeService } from '../../lure-bait-type-service';
import { LureBaitTypeViewModel } from '../../../../../core/view-models/lure-bait-type-view-model';

@Component({
  selector: 'app-lure-bait-type-detail',
  imports: [RouterLink, MatChipsModule, MatDividerModule, MatCardModule, MatIconModule, Breadcrumb, Loading],
  templateUrl: './lure-bait-type-detail.html',
  styleUrl: './lure-bait-type-detail.scss',
})
export class LureBaitTypeDetail {
  private route = inject(ActivatedRoute);
  private svc = inject(LureBaitTypeService);
  private utilities = inject(Utilities);

  vm = signal<LureBaitTypeViewModel | null>(null);
  loading = signal<boolean>(false);   // ← 本地 loading

  ngOnInit(): void {
    this.route.paramMap.pipe(
      map(pm => pm.get('id')),
      map(raw => raw === null ? NaN : Number(raw)),
      filter(id => Number.isFinite(id) && id > 0),

      // 单通道：上一请求未完成时忽略新触发（与你列表页一致）
      exhaustMap(id => {
        this.loading.set(true);  // ← 本地 loading 开始
        return this.svc.getLureBaitTypeById(id).pipe(
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
