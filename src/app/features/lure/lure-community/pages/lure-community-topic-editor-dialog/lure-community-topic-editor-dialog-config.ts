// topic-editor-config.ts
import type { EditorConfig, ToolbarConfigItem } from 'ckeditor5';
import type { HeadingOption } from '@ckeditor/ckeditor5-heading';

const TOOLBAR_ITEMS: ToolbarConfigItem[] = [
  'heading', '|',
  'bold', 'italic', 'link', '|',
  'bulletedList', 'numberedList', 'blockQuote', 'codeBlock', '|',
  'undo', 'redo'
];

const HEADING_OPTIONS: HeadingOption[] = [
  { model: 'paragraph', title: '正文', class: 'ck-heading_paragraph' },
  { model: 'heading1', view: 'h2', title: '小标题', class: 'ck-heading_heading1' },
  { model: 'heading2', view: 'h3', title: '次级标题', class: 'ck-heading_heading2' }
];

export const topicEditorConfig: EditorConfig = {
  licenseKey: 'GPL',
  placeholder: '写点什么吧…（支持标题、列表、引用、链接）',
  toolbar: { items: TOOLBAR_ITEMS, shouldNotGroupWhenFull: true },
  heading: { options: HEADING_OPTIONS },
  link: { addTargetToExternalLinks: true, defaultProtocol: 'https://' }
};
