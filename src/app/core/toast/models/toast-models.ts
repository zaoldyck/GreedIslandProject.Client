export type ToastType = 'success' | 'alert';

export interface ToastModel {
  id: number;
  type: ToastType;
  message: string;
  createdAt: number;
  /** 毫秒；仅对 success 有效（alert 不自动消失） */
  duration?: number;
  /** 退出动画标记（内部使用） */
  closing?: boolean;
}
