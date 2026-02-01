import { Component, computed, DestroyRef, Inject, inject, signal } from '@angular/core';
import { ToastService } from '../../../../../core/toast/services/toast-service';
import { TopicEditorDialogData, TopicEditorDialogResult } from './lure-community-topic-editor-dialog-data';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CdkDrag, CdkDragHandle } from '@angular/cdk/drag-drop';
import { TranslocoModule } from '@jsverse/transloco';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-lure-community-topic-editor-dialog',
  imports: [CdkDrag, CdkDragHandle, TranslocoModule, MatButtonModule, MatDialogModule, MatIconModule,],
  templateUrl: './lure-community-topic-editor-dialog.html',
  styleUrl: './lure-community-topic-editor-dialog.scss',
})
export class LureCommunityTopicEditorDialog {
  private readonly toast = inject(ToastService);
 
  readonly isLoading = signal(false);

  constructor(
    @Inject(MAT_DIALOG_DATA) public readonly data: TopicEditorDialogData,
    private readonly ref: MatDialogRef<LureCommunityTopicEditorDialog, TopicEditorDialogResult>
  ) {
     
  }
  

  cancel(): void {
    this.ref.close(undefined);
  }
}
