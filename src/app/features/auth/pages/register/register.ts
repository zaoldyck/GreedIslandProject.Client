import { Component, computed, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastService } from '../../../../core/toast/services/toast-service';
import { RegisterService } from '../../services/register-service';
import { NgClass } from '@angular/common';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserAgreementDialog } from '../../../../shared/legal/user-agreement-dialog/user-agreement-dialog';
import { CaptchaService } from '../../../../core/services/captcha-service';

const CN_PHONE = /^1[3-9]\d{9}$/;                         // 大陆手机号 11 位
const OPTIONAL_PASSWORD_PATTERN = /^(?=.*\d)(?=.*[A-Za-z]).{8,}$/; // 至少8位，含数字和字母

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatStepperModule, MatCheckboxModule, MatDialogModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  private fb = inject(FormBuilder);
  private svc = inject(RegisterService);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);
  private captchaService = inject(CaptchaService);
  // 第一步：手机号 + 短信码
  phoneForm = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(CN_PHONE)]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    agreement: [false, Validators.requiredTrue] // 新增：必须勾选
  });

  // 第二步：个人信息（密码可选）
  profileForm = this.fb.group({
    displayName: [''],
    email: ['', [Validators.email]],
    password: [''],
    confirmPassword: ['']
  }, { validators: [this.optionalPasswordValidator.bind(this)] });

  // 一次性注册票据（由后端颁发）
  registerTicket = signal<string | null>(null);

  // 发送短信按钮状态
  sending = signal(false);
  countdown = signal(0);

  get canSend() { return computed(() => !this.sending() && this.countdown() === 0); }

  // 发送验证码（60s 冷却）
  sendCode() {
    const phoneCtrl = this.phoneForm.controls.phone;
    if (phoneCtrl.invalid) {
      phoneCtrl.markAsTouched();
      this.toastService.showAlert('请输入有效的手机号');
      return;
    }
    this.sending.set(true);
    this.svc.sendSms({ phone: phoneCtrl.value, purpose: 'register', captchaToken: '' }).subscribe({
      next: () => {
        this.toastService.showSuccess('验证码已发送');
        this.startCountdown(60);
      },
      error: (err) => {
        this.toastService.showAlert(err?.error?.message || '发送验证码失败，请稍后重试');
      },
      complete: () => this.sending.set(false)
    });
  }

  private startCountdown(sec: number) {
    this.countdown.set(sec);
    const t = setInterval(() => {
      const v = this.countdown();
      if (v <= 1) { this.countdown.set(0); clearInterval(t); }
      else this.countdown.set(v - 1);
    }, 1000);
  }

  // 校验短信码 → 获取注册票据
  verifyPhone(stepper: MatStepper) {
    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      this.toastService.showAlert('请正确填写手机号和验证码');
      return;
    }

    const { phone, code } = this.phoneForm.getRawValue();

    this.svc.verifySms({ phone, code })
      // .pipe(take(1), finalize(() => { /* 可选：收尾逻辑，如关闭loading */ }))
      .subscribe({
        next: (res) => {
          // 写入注册票据
          this.registerTicket.set(res.registerTicket);

          // ✅ 清理 code 控件上可能残留的 server 错误（防止成功后仍显示红字）
          const ctrl = this.phoneForm.controls.code;
          if (ctrl.errors?.['server']) {
            const { server, ...rest } = ctrl.errors;
            ctrl.setErrors(Object.keys(rest).length ? rest : null);
            ctrl.updateValueAndValidity({ emitEvent: false });
          }

          this.toastService.showSuccess('手机号验证成功');

          // 直接在方法里推进 stepper
          stepper.next();
        },

        error: (err) => {
          // 按 ASP.NET Core ValidationProblemDetails 结构解析
          const problem = err?.error as
            | { errors?: Record<string, string[]>; title?: string; status?: number }
            | undefined;

          // 标记是否已给出具体字段级提示，若没有再给兜底 Toast
          let hinted = false;

          // 优先处理 code 字段
          const codeMsgs = problem?.errors?.['code'];
          if (Array.isArray(codeMsgs) && codeMsgs.length > 0) {
            const ctrl = this.phoneForm.controls.code;
            ctrl.setErrors({ ...(ctrl.errors ?? {}), server: codeMsgs[0] });
            ctrl.markAsTouched();
            hinted = true;
          }

          // 分发其他字段错误（若后端返回了）
          if (problem?.errors) {
            for (const [key, msgs] of Object.entries(problem.errors)) {
              if (key === 'code') continue; // code 已处理
              const c = this.phoneForm.get(key);
              if (c && msgs?.length) {
                c.setErrors({ ...(c.errors ?? {}), server: msgs.join(' ') });
                c.markAsTouched();
                hinted = true;
              }
            }
          }

          // 若没有结构化字段错误，再给一个兜底提示
          if (!hinted) {
            this.toastService.showAlert(err?.error?.message ?? '验证码错误或已过期');
          }
        },
      });
  }

  // 密码可选校验：只有填写时才检查强度与一致性
  private optionalPasswordValidator(group: AbstractControl): ValidationErrors | null {
    const pwd = group.get('password')?.value as string | undefined;
    const cfm = group.get('confirmPassword')?.value as string | undefined;
    if (!pwd && !cfm) return null;                // 都没填：不校验
    if (pwd && !OPTIONAL_PASSWORD_PATTERN.test(pwd)) return { passwordWeak: true };
    if (pwd !== cfm) return { passwordMismatch: true };
    return null;
  }
  submitting = signal(false);

  // 完成注册
  complete() {
    if (!this.registerTicket()) {
      this.toastService.showAlert('请先完成手机号验证');
      return;
    }
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toastService.showAlert('请修正表单错误后再提交');
      return;
    }

    this.submitting.set(true);
    const { displayName, email, password } = this.profileForm.getRawValue();

    this.svc.completeRegister({
      registerTicket: this.registerTicket()!,
      displayName: displayName || null,
      email: email || null,
      password: password || null,
      autoLogin: false  // 如需“注册即登录”，改为 true
    }).subscribe({
      next: () => {
        this.toastService.showSuccess('注册成功');
        // TODO: 这里按你的流程跳转：登录页 / 授权页 / 个人中心
      },
      error: (err) => {
        // 约定的 ProblemDetails: { errors: { [field: string]: string[] } }
        const errors = err?.error?.errors as Record<string, string[]> | undefined;

        // 兼容不同键名：password / Password / 空键（部分后端把通用错误丢在空键）
        const serverMsgs =
          errors?.['password'] ??
          errors?.['Password'] ??
          errors?.[''] ??
          null;

        if (serverMsgs?.length) {
          const pwdCtrl = this.profileForm.controls.password!;
          // 合并到已有错误（不覆盖 pattern/required 等）
          const prev = pwdCtrl.errors ?? {};
          pwdCtrl.setErrors({ ...prev, server: serverMsgs.join(' ') });
          pwdCtrl.markAsTouched(); // 触发 mat-error 显示
        }

        this.toastService.showAlert('注册失败，请稍后再试');
      },
      complete: () => this.submitting.set(false)
    });
  }

  openUserAgreementDialog(): void {
    this.dialog.open(UserAgreementDialog, {
      width: '880px',
      maxWidth: '90vw',
      maxHeight: '80vh',
      autoFocus: false,
      restoreFocus: true,
      panelClass: 'legal-dialog',
    });
  }
}
