import { TagViewModel } from "../../core/view-models/tag-view-model";

// shared/tag-select-dialog/tag-select-dialog.types.ts
export interface TagSelectDialogData {
  title: string;
  allowMultiple: boolean;
  selected?: TagViewModel[];       // 初始选中
  moduleCode?: string;             // 当前模块名（或）
}
