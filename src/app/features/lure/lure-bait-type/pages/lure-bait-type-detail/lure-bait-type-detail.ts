import { Component, inject, signal } from '@angular/core';
import { Breadcrumb } from '../../../../../shared/breadcrumb/breadcrumb';
import { Loading } from '../../../../../shared/loading/loading';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';

import { Utilities } from '../../../../../core/utils/utilities';

import { catchError, EMPTY, exhaustMap, filter, finalize, map, tap } from 'rxjs';
import { LureBaitTypeService } from '../../lure-bait-type-service';
import { LureBaitTypeViewModel } from '../../../../../core/view-models/lure-bait-type-view-model';
import { NgxEchartsDirective, provideEchartsCore } from 'ngx-echarts';
import * as echarts from 'echarts/core';
import { RadarChart } from 'echarts/charts';

import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  RadarComponent,           // 雷达坐标系组件
} from 'echarts/components';
import { CanvasRenderer } from 'echarts/renderers';

echarts.use([
  RadarChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  RadarComponent,
  CanvasRenderer,
]);

@Component({
  selector: 'app-lure-bait-type-detail',
  imports: [NgxEchartsDirective, MatChipsModule, MatDividerModule, MatCardModule, MatIconModule, Breadcrumb, Loading],
  templateUrl: './lure-bait-type-detail.html',
  styleUrl: './lure-bait-type-detail.scss',
  providers: [
    provideEchartsCore({ echarts }),
  ]
})
export class LureBaitTypeDetail {
  private route = inject(ActivatedRoute);
  private svc = inject(LureBaitTypeService);
  private utilities = inject(Utilities);

  vm = signal<LureBaitTypeViewModel | null>(null);
  loading = signal<boolean>(false);   // ← 本地 loading

  radarOption = signal<any>({
    title: { text: '' },
    tooltip: {},
    legend: { data: [] },
    radar: { indicator: [] },
    series: []
  });

  private applyRadarFromVm(vm: LureBaitTypeViewModel) {
    const toPercent = (v: number | null | undefined) =>
      Math.max(0, Math.min(100, Number(v ?? 50)));

    const values = [
      toPercent(vm.actionIntensity),
      toPercent(vm.depthCoverage),
      toPercent(vm.castingDistance),
      toPercent(vm.antiSnag),
      toPercent(vm.hookupRate),
      toPercent(vm.durability),
      toPercent(vm.skillEase),
      toPercent(vm.priceToValue),
    ];

    const displayName = vm.name ?? vm.englishName ?? vm.slug ?? '该类别';

    // ★ Zoneless 关键：用 update() 返回一个“全新对象”
    this.radarOption.update(opt => ({
      ...opt,
      title: { text: `${displayName} 雷达图` },
      legend: { data: [displayName] },
      radar: {
        ...opt.radar,
        indicator: [
          { name: '动作强度', max: 100 },
          { name: '水层覆盖', max: 100 },
          { name: '抛投能力', max: 100 },
          { name: '防挂能力', max: 100 },
          { name: '中鱼效率', max: 100 },
          { name: '耐用度', max: 100 },
          { name: '易上手', max: 100 },
          { name: '价格友好', max: 100 },
        ],
      },
      series: [
        {
          type: 'radar',
          areaStyle: { opacity: 0.3 },
          data: [{ value: values, name: displayName }],
        },
      ],
    }));
  }

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
            this.vm.set(vm);
            if (vm) {
              this.applyRadarFromVm(vm);
            }
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
