import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, DestroyRef, inject, Inject, signal } from '@angular/core';
import { TagTypeViewModel } from '../../core/view-models/tag-type-view-model';
import { CommonService } from '../../core/services/common-service';
import { moduleTagTypeMappers } from '../../core/config/module-tag-type-mapper';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TagSelectDialogData } from './tag-select-dialog-data';
import { TagViewModel } from '../../core/view-models/tag-view-model';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-tag-select-dialog',
  imports: [ MatSlideToggleModule,MatProgressSpinnerModule,MatButtonModule,MatDialogModule,MatIconModule, MatChipsModule],
  templateUrl: './tag-select-dialog.html',
  styleUrl: './tag-select-dialog.scss',
})
export class TagSelectDialog {
  private commonService = inject(CommonService);

  readonly tagTypes = signal<TagTypeViewModel[]>([]);
  readonly selected = signal<TagViewModel[]>([]);
  readonly isLoading = signal(false);
  private destroyRef = inject(DestroyRef);
  matchMode: 'AND' | 'OR' = 'AND';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TagSelectDialogData,
    private ref: MatDialogRef<TagSelectDialog, TagTypeViewModel[]>
  ) {
    // 初始选中
    this.selected.set([...(data?.selected ?? [])]);
  }
 
ngOnInit() {
  const allowedCodes = this.resolveAllowedCodes(this.data);

  this.isLoading.set(true); // ✅ 请求开始前置为 loading

  this.commonService.getTagTypes(allowedCodes).pipe(
    takeUntilDestroyed(this.destroyRef), // ✅ 对话框关闭后自动取消订阅
    finalize(() => this.isLoading.set(false)) // ✅ 无论 next/error/complete 都复位
  ).subscribe({
    next: (list) => {
      const all = (list ?? []);

      // 如果配置了允许的标签 codes，则按 code 过滤；否则保留全部
      const filtered = allowedCodes.length
        ? all.filter(t => allowedCodes.includes(String(t.code).toUpperCase()))
        : all;

      this.tagTypes.set(filtered);
    },
    error: (err) => {
      console.error('getTagTypes error:', err);
      // 可选：这里提示错误，例如用你的自定义 toast
    },
  });
}


  onMatchModeChange(evt: { checked: boolean }) {
    // ✅ 未选中(checked=false) → AND；选中(checked=true) → OR
    this.matchMode = evt.checked ? 'OR' : 'AND';
  }

  /** 根据 data.moduleCode 或 data.moduleName 解析允许的标签 code（全大写） */
  private resolveAllowedCodes(data: TagSelectDialogData): string[] {
    if (data?.moduleCode) {
      const m = moduleTagTypeMappers.find(x => x.moduleCode.toUpperCase() === data.moduleCode!.toUpperCase());
      return m?.tagTypeCodes ?? [];
    }
    return [];
  }

  isSelected(t: TagTypeViewModel): boolean {
    return this.selected().some(x => String(x.id) === String(t.id));
  }

  toggle(t: TagTypeViewModel): void {
   
  }

  clear(): void {
    this.selected.set([]);
  }

  confirm(): void {
    
  }

  cancel(): void {
    this.ref.close(undefined);
  }
}
