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
// 适合“社区发帖/话题编辑”的基础配置（开源免费功能向）
export const topicEditorConfig = {
  // CKEditor 5 新安装方式的 Angular 文档示例明确提到需要 licenseKey，可用 'GPL'（走 GPL 合规）[1](https://codinglatte.com/posts/angular/reusable-modal-overlay-using-angular-cdk-overlay/)
  licenseKey: 'GPL',

  placeholder: '写点什么吧…（支持标题、列表、引用、链接）',

  toolbar: {
    items: [
      'heading',
      '|',
      'bold',
      'italic',
      'link',
      '|',
      'bulletedList',
      'numberedList',
      'blockQuote',
      'codeBlock',
      '|',
      'undo',
      'redo'
    ],
    shouldNotGroupWhenFull: true
  },

  // 让粘贴内容更“干净”，避免从网页/文档复制来一堆样式
  // （注意：这是策略配置，不是 premium 功能）
  pasteFromOffice: {
    // 尽量保留结构，减少复杂样式
    keepStyles: false
  },

  // 基础 heading 设置：发帖常用 2~3 个级别就够了
  heading: {
    options: [
      { model: 'paragraph', title: '正文', class: 'ck-heading_paragraph' },
      { model: 'heading2', view: 'h2', title: '小标题', class: 'ck-heading_heading2' },
      { model: 'heading3', view: 'h3', title: '次级标题', class: 'ck-heading_heading3' }
    ]
  },

  // 链接：允许用户加 target、rel，避免 SEO/安全问题
  link: {
    addTargetToExternalLinks: true,
    defaultProtocol: 'https://',
    decorators: {
      openInNewTab: {
        mode: 'manual',
        label: '新窗口打开',
        attributes: {
          target: '_blank',
          rel: 'noopener noreferrer'
        }
      }
    }
  },

  // 如果你后面要支持图片上传（自定义 UploadAdapter），这里先预留不配也行
  // image: { toolbar: [...] },

  // 可选：语言
  // language: 'zh-cn',
} as const;
