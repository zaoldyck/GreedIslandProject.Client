import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Component, inject, Inject, signal } from '@angular/core';
import { TagTypeViewModel } from '../../core/view-models/tag-type-view-model';
import { CommonService } from '../../core/services/common-service';
@Component({
  selector: 'app-tag-select-dialog',
  imports: [],
  templateUrl: './tag-select-dialog.html',
  styleUrl: './tag-select-dialog.scss',
})
export class TagSelectDialog {
  private commonService = inject(CommonService);

  readonly tagTypes = signal<TagTypeViewModel[]>([]);
  readonly selected = signal<TagTypeViewModel[]>([]);

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { selected?: TagTypeViewModel[]; allowMultiple?: boolean; title?: string },
    private ref: MatDialogRef<TagSelectDialog, TagTypeViewModel[]>
  ) {
    // 初始选中
    this.selected.set([...(data?.selected ?? [])]);
  }

  ngOnInit() {
    this.commonService.getTagTypes().subscribe({
      next: (list) => this.tagTypes.set(list ?? []),
      error: (err) => console.error('getTagTypes error:', err),
    });
  }

  isSelected(t: TagTypeViewModel): boolean {
    return this.selected().some(x => String(x.id) === String(t.id));
  }

  toggle(t: TagTypeViewModel): void {
    const multi = this.data?.allowMultiple ?? true;
    if (!multi) {
      // 单选
      this.selected.set(this.isSelected(t) ? [] : [t]);
      return;
    }
    if (this.isSelected(t)) {
      this.selected.set(this.selected().filter(x => String(x.id) !== String(t.id)));
    } else {
      this.selected.set([...this.selected(), t]);
    }
  }

  clear(): void {
    this.selected.set([]);
  }

  confirm(): void {
    this.ref.close(this.selected());
  }

  cancel(): void {
    this.ref.close(undefined);
  }
}
