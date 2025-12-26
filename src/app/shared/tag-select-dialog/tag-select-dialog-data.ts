import { TagViewModel } from "../../core/view-models/tag-view-model";

// shared/tag-select-dialog/tag-select-dialog.types.ts
export interface TagSelectDialogData {
  title: string;
  allowMultiple: boolean;
  selectedIds?: Array<number>;  
  moduleCode?: string;         
}
