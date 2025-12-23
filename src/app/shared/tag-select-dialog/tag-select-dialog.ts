import { Component, inject, signal } from '@angular/core';
import { CommonService } from '../../core/services/common-service';
import { TagTypeViewModel } from '../../core/view-models/tag-type-view-model';

@Component({
  selector: 'app-tag-select-dialog',
  imports: [],
  templateUrl: './tag-select-dialog.html',
  styleUrl: './tag-select-dialog.scss',
})
export class TagSelectDialog {
  private commonService = inject(CommonService);
  readonly tagTypes = signal<TagTypeViewModel[]>([]);
  ngOnInit() {
    this.commonService.getTagTypes()
      .subscribe({
        next: (list) => this.tagTypes.set(list ?? []),
        error: (err) => console.error('getTags error:', err),
      });
  }
}
