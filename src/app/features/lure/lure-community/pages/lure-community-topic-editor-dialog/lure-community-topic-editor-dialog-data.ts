import { LureCommunityCategoryViewModel } from "../../../../../core/view-models/lure-community-category-view-model";

export type TopicEditorMode = 'create' | 'edit';

export interface TopicEditorDialogData {
  mode: TopicEditorMode;
  category?: LureCommunityCategoryViewModel;   // create 用
  topicId?: number;                            // edit 用（或直接传 topic）
}

export interface TopicEditorDialogResult {
  mode: TopicEditorMode;
  categoryId: number;
  title: string;
  content: string;
}
