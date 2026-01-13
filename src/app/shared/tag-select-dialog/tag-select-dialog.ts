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

import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { TranslocoModule } from '@jsverse/transloco';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { Loading } from '../loading/loading';

import { ToastService } from '../../core/toast/services/toast-service';

@Component({
  selector: 'app-tag-select-dialog',
  imports: [CdkDrag, CdkDragHandle, TranslocoModule, MatCheckboxModule, MatSlideToggleModule, Loading, MatButtonModule, MatDialogModule, MatIconModule, MatChipsModule],
  templateUrl: './tag-select-dialog.html',
  styleUrl: './tag-select-dialog.scss'
})
export class TagSelectDialog {
  private commonService = inject(CommonService);
  private toastService = inject(ToastService);

  /** 最多可选择的标签数量（上限） */
  private static readonly MAX_SELECTED = 3;

  readonly tagTypes = signal<TagTypeViewModel[]>([]);
  private readonly _selectedIds = signal<Set<number>>(new Set());

  /** 已选标签对象数组（派生） */
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

  /** 已选数量（派生） */
  readonly selectedCount = computed(() => this._selectedIds().size);

  readonly isLoading = signal(false);
  private destroyRef = inject(DestroyRef);
  matchMode: 'AND' | 'OR' = 'AND';

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: TagSelectDialogData,
    private ref: MatDialogRef<TagSelectDialog, TagSelectResult>
  ) {
    const initIds = new Set<number>();

    if (data?.selectedIds?.length) {
      // 防御：初始值也最多只取 100 个
      for (const id of data.selectedIds.slice(0, TagSelectDialog.MAX_SELECTED)) {
        initIds.add(id);
      }
    }

    this._selectedIds.set(initIds);

    if (data?.matchMode) {
      this.matchMode = data.matchMode;
    }
  }

  ngOnInit() {
    const allowedCodes = this.resolveAllowedCodes(this.data);

    this.isLoading.set(true);

    this.commonService.getTagTypes(allowedCodes).pipe(
      takeUntilDestroyed(this.destroyRef),
      finalize(() => this.isLoading.set(false))
    ).subscribe({
      next: (list) => {
        const all = (list ?? []);
        const filtered = allowedCodes.length
          ? all.filter(t => allowedCodes.includes(String(t.code).toUpperCase()))
          : all;
        this.tagTypes.set(filtered);
      },
      error: (err) => {
        console.error('getTagTypes error:', err);
      },
    });
  }

  onMatchModeChange(evt: MatSlideToggleChange) {
    this.matchMode = evt.checked ? 'OR' : 'AND';
  }

  private resolveAllowedCodes(data: TagSelectDialogData): string[] {
    if (data?.moduleCode) {
      const m = moduleTagTypeMappers.find(x => x.moduleCode === data.moduleCode!);
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

  /** 限制最多 100 个标签；超过则提示并阻止新增 */
  toggle(tag: TagViewModel, checked: boolean): void {
    const next = new Set(this._selectedIds());
    const already = next.has(tag.id);

    if (checked) {
      if (!already) {
        if (next.size >= TagSelectDialog.MAX_SELECTED) {
          this.toastService.showAlert(`最多可选择 ${TagSelectDialog.MAX_SELECTED} 个标签`);
          return; // 阻止新增
        }
        next.add(tag.id);
      }
    } else {
      if (already) next.delete(tag.id);
    }

    this._selectedIds.set(next);
  }

  clear(): void {
    this._selectedIds.set(new Set());
  }

  confirm(): void {
    // 如需兜底（防止外部绕过 UI），可以解开下面一行：
    // const limited = this.selectedTags().slice(0, TagSelectDialog.MAX_SELECTED);

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
