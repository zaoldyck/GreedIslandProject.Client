import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, computed, DestroyRef, inject, Inject, signal } from '@angular/core';
import { TagTypeViewModel } from '../../core/view-models/tag-type-view-model';
import { CommonService } from '../../core/services/common-service';
import { moduleTagTypeMappers } from '../../core/config/module-tag-type-mapper';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { TagSelectDialogData, TagSelectResult } from './tag-select-dialog-data';
import { TagViewModel } from '../../core/view-models/tag-view-model';
import { MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { finalize } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslocoModule } from '@jsverse/transloco';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
@Component({
  selector: 'app-tag-select-dialog',
  imports: [CdkDrag,CdkDragHandle,TranslocoModule,MatCheckboxModule,MatSlideToggleModule,MatProgressSpinnerModule,MatButtonModule,MatDialogModule,MatIconModule, MatChipsModule],
  templateUrl: './tag-select-dialog.html',
  styleUrl: './tag-select-dialog.scss' 
})
export class TagSelectDialog {
  private commonService = inject(CommonService);

  readonly tagTypes = signal<TagTypeViewModel[]>([]);
  private readonly _selectedIds = signal<Set<number>>(new Set());

  // 已选标签对象数组（派生）
  readonly selectedTags = computed<TagViewModel[]>(() => {
    const ids = this._selectedIds();
    const out: TagViewModel[] = [];
    for (const type of this.tagTypes()) {
      for (const tag of type.tags ?? []) {
        if (ids.has(tag.id)) out.push(tag);
      }
    }
    return out;
  });

  readonly isLoading = signal(false);
  private destroyRef = inject(DestroyRef);
  matchMode: 'AND' | 'OR' = 'AND';
  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TagSelectDialogData,
    private ref: MatDialogRef<TagSelectDialog, TagSelectResult>
  ) {

    const initIds = new Set<number>();

    if (data?.selectedIds?.length) {
      for (const id of data.selectedIds) initIds.add(id);
    } 

    this._selectedIds.set(initIds); // ✅ 单一事实来源：Set<number>

    if (data?.matchMode) {
      this.matchMode = data.matchMode;
    }

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



  onMatchModeChange(evt: MatSlideToggleChange) {
    // 选中 => OR；未选中 => AND （与你之前的逻辑一致）
    this.matchMode = evt.checked ? 'OR' : 'AND';
  }


 
  private resolveAllowedCodes(data: TagSelectDialogData): string[] {
    if (data?.moduleCode) {
      const m = moduleTagTypeMappers.find(x => x.moduleCode=== data.moduleCode!);
      return m?.tagTypeCodes ?? [];
    }
    return [];
  }


  isSelected(tag: TagViewModel): boolean {
    return this._selectedIds().has(tag.id);
  }


  remove(tagId: number): void {
    const next = new Set(this._selectedIds());
    next.delete(tagId);
    this._selectedIds.set(next);
  }


  toggle(tag: TagViewModel, checked: boolean): void {
    const next = new Set(this._selectedIds());
    if (checked) next.add(tag.id);
    else next.delete(tag.id);
    this._selectedIds.set(next);
  }



  clear(): void {
    this._selectedIds.set(new Set());
  }





  confirm(): void {
    const result: TagSelectResult = {
      tags: this.selectedTags(),
      matchMode: this.matchMode,
    };
    this.ref.close(result);
  }




  cancel(): void {
    this.ref.close(undefined);
  }
}
