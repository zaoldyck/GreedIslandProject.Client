 
import { TagViewModel } from '../../core/view-models/tag-view-model';

export type MatchMode = 'AND' | 'OR';

export interface TagSelectDialogData {
  title: string;
  allowMultiple: boolean;
  selectedIds?: number[];
  moduleCode?: string;
  /** 新增：当前匹配模式，供弹窗初始化 */
  matchMode?: MatchMode; // 不传则弹窗默认 'OR'
}

export interface TagSelectResult {
  tags: TagViewModel[];   // 选中的标签
  matchMode: MatchMode;   // AND / OR
}
