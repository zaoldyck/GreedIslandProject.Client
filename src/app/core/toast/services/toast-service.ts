
import { Injectable, signal, Injector, inject } from '@angular/core';
import { Overlay, OverlayRef, OverlayContainer } from '@angular/cdk/overlay';
import { ComponentPortal } from '@angular/cdk/portal';
import { Toast } from '../components/toast/toast';
import { ToastModel, ToastType } from '../models/toast-models';

type PopoverHost = HTMLElement & {
  showPopover?: () => void;
  hidePopover?: () => void;
};

@Injectable({ providedIn: 'root' })
export class ToastService {
  private _toasts = signal<ToastModel[]>([]);
  private _idSeed = 1;
  private _timers = new Map<number, ReturnType<typeof setTimeout>>();

  maxVisible = 5;
  defaultDuration = 3000;

  toasts = this._toasts.asReadonly();

  private overlay = inject(Overlay);
  private overlayContainer = inject(OverlayContainer);
  private injector = inject(Injector);
  private overlayRef?: OverlayRef;

  constructor() {
    // 提前启动监听（确保在 AppComponent 构造里注入本服务）
    this.observeTopLayer();
  }

  // ---------- Public API ----------

  showSuccess(message: string, duration = this.defaultDuration) {
    this.ensureOverlay();
    this.raiseToastOnTopLayer(); // 弹之前先置顶（稳）
    return this.push({ type: 'success', message, duration });
  }

  showAlert(message: string) {
    this.ensureOverlay();
    this.raiseToastOnTopLayer();
    return this.push({ type: 'alert', message, duration: undefined });
  }

  dismiss(id: number) {
    this._toasts.update(list => list.map(t => t.id === id ? { ...t, closing: true } : t));
    setTimeout(() => this.removeNow(id), 180);
  }

  clearAll() {
    for (const t of this._toasts()) this.dismiss(t.id);
  }

  // ---------- Private ----------

  private ensureOverlay() {
    if (!this.overlayRef) {
      this.overlayRef = this.overlay.create({
        hasBackdrop: false,
        disposeOnNavigation: false,
        scrollStrategy: this.overlay.scrollStrategies.reposition(),
        positionStrategy: this.overlay.position()
          .global()
          .centerHorizontally()
          .bottom('24px'),
        panelClass: ['my-toast-pane']
      });

      this.overlayRef.hostElement.classList.add('my-toast-wrapper');

      const portal = new ComponentPortal(Toast, null, this.injector);
      this.overlayRef.attach(portal);

      // 初次 attach 后也置顶一次
      this.raiseToastOnTopLayer();
    } else if (!this.overlayRef.hasAttached()) {
      const portal = new ComponentPortal(Toast, null, this.injector);
      this.overlayRef.attach(portal);
      this.raiseToastOnTopLayer();
    }
  }

  /** 关键：真正改变 Top Layer 顺序（对 wrapper 调 Popover API） */
  private raiseToastOnTopLayer() {
    const host = this.overlayRef?.hostElement as PopoverHost | undefined;
    if (!host) return;

    // 有 Popover API：最轻量的方式
    if (host.showPopover) {
      host.hidePopover?.();
      requestAnimationFrame(() => host.showPopover!());
      return;
    }

    // Fallback：极老环境可改成 dispose->create（此处简单跳过）
  }

  /** 只监听 Popover 事件，足以覆盖“关 -> 再开 dialog”的场景 */
  private observeTopLayer() {
    const container = this.overlayContainer.getContainerElement();

    const onToggle = (ev: Event) => {
      const el = ev.target as HTMLElement | null;
      if (!el) return;

      // 仅当是“包含 backdrop 的 overlay wrapper”时，才置顶 toast
      if (
        el.classList.contains('cdk-global-overlay-wrapper') &&
        el.querySelector('.cdk-overlay-backdrop')
      ) {
        // 放到下一帧，等 Material 完成 class/状态切换
        requestAnimationFrame(() => this.raiseToastOnTopLayer());
      }
    };

    // 用捕获阶段，防止事件被内部 stop
    container.addEventListener('beforetoggle', onToggle, true);
    container.addEventListener('toggle', onToggle, true);
  }

  // ---------- data ops ----------

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
