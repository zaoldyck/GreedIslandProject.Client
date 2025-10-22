import { Injectable, signal } from '@angular/core';
import { ToastModel, ToastType } from '../models/ToastModels';
@Injectable({
  providedIn: 'root'
})
export class ToastService {
  private _toasts = signal<ToastModel[]>([]);
  private _idSeed = 1;
  private _timers = new Map<number, ReturnType<typeof setTimeout>>();

  /** 同屏最多显示条数 */
  maxVisible = 5;
  /** 成功提示默认持续时长（ms） */
  defaultDuration = 3000;

  /** 只读给组件订阅 */
  toasts = this._toasts.asReadonly();

  /** 绿色成功：自动消失 */
  showSuccess(message: string, duration = this.defaultDuration) {
    return this.push({ type: 'success', message, duration });
  }

  /** 红色警告：不自动消失 */
  showAlert(message: string) {
    return this.push({ type: 'alert', message, duration: undefined });
  }

  /** 手动关闭某条 */
  dismiss(id: number) {
    // 标记 closing 触发 CSS 过渡，再延迟真正移除
    this._toasts.update(list => list.map(t => t.id === id ? { ...t, closing: true } : t));
    setTimeout(() => this.removeNow(id), 180);
  }

  /** 全部关闭（带过渡） */
  clearAll() {
    for (const t of this._toasts()) this.dismiss(t.id);
  }

  // ---------------- private ----------------

  private push(input: { type: ToastType; message: string; duration?: number }) {
    const id = this._idSeed++;
    const toast: ToastModel = {
      id,
      type: input.type,
      message: input.message,
      duration: input.duration,
      createdAt: Date.now()
    };

    this._toasts.update(list => {
      let next = [...list, toast];

      // 超上限：优先移除最早的 success；若没有 success，则移除队头
      if (next.length > this.maxVisible) {
        const idx = next.findIndex(t => t.type === 'success');
        if (idx >= 0) {
          this.clearTimer(next[idx].id);
          next.splice(idx, 1);
        } else {
          this.clearTimer(next[0].id);
          next = next.slice(1);
        }
      }
      return next;
    });

    // 自动消失（仅 success）
    if (toast.type === 'success' && toast.duration && toast.duration > 0) {
      const timer = setTimeout(() => this.dismiss(id), toast.duration);
      this._timers.set(id, timer);
    }

    return id;
  }

  private removeNow(id: number) {
    this.clearTimer(id);
    this._toasts.update(list => list.filter(t => t.id !== id));
  }

  private clearTimer(id: number) {
    const timer = this._timers.get(id);
    if (timer) {
      clearTimeout(timer);
      this._timers.delete(id);
    }
  }
}
