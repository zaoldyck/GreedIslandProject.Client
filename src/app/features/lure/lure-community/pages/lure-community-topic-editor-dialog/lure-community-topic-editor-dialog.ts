import { Component, computed, DestroyRef, Inject, inject, PLATFORM_ID, signal } from '@angular/core';
import { ToastService } from '../../../../../core/toast/services/toast-service';
import { topicEditorConfig, TopicEditorDialogData, TopicEditorDialogResult } from './lure-community-topic-editor-dialog-data';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { TranslocoModule } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TagViewModel } from '../../../../../core/view-models/tag-view-model';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { CKEditorModule } from '@ckeditor/ckeditor5-angular';
import { isPlatformBrowser } from '@angular/common';
 
@Component({
  selector: 'app-lure-community-topic-editor-dialog',
  imports: [CKEditorModule,MatInputModule,MatSelectModule,MatFormFieldModule,MatProgressSpinnerModule,ReactiveFormsModule, CdkDrag, CdkDragHandle, TranslocoModule, MatButtonModule, MatDialogModule, MatIconModule,],
  templateUrl: './lure-community-topic-editor-dialog.html',
  styleUrl: './lure-community-topic-editor-dialog.scss',
})
export class LureCommunityTopicEditorDialog {
  private readonly toast = inject(ToastService);
  private readonly fb = inject(FormBuilder);
  readonly isLoading = signal(false);
  readonly editor = signal<any | null>(null);
  public readonly editorConfig = topicEditorConfig;
  readonly form = this.fb.nonNullable.group({
    categoryId: [0, [Validators.required]],
    title: ['', [Validators.required, Validators.maxLength(80)]],
    content: ['', [Validators.required, Validators.maxLength(5000)]],
    tags: this.fb.nonNullable.control<TagViewModel[]>([]),
  });

  constructor(@Inject(PLATFORM_ID) platformId: object,
    @Inject(MAT_DIALOG_DATA) public readonly data: TopicEditorDialogData,
    private readonly ref: MatDialogRef<LureCommunityTopicEditorDialog, TopicEditorDialogResult>
  ) {
    if (isPlatformBrowser(platformId)) {
      // ✅ 只在浏览器加载
      void this.loadEditor();
    }

  }

  private async loadEditor() {
    // ✅ 只装开源功能时：只需要 ckeditor5（不要 premium 包）
    const ck = await import('ckeditor5');
    this.editor.set(ck.ClassicEditor);
  }

  cancel(): void {
    this.ref.close(undefined);
  }
  submit(): void {
    this.ref.close(undefined);
  }
}
