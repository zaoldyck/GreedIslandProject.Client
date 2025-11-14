import { Component, computed, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { Router, RouterLink } from '@angular/router';
import { AuthenticationService } from '../../../../core/services/authentication-service';
import { ToastService } from '../../../../core/toast/services/toast-service';
import { Utilities } from '../../../../core/utils/utilities';
import { CaptchaService } from '../../../../core/services/captcha-service';
import { SendSmsRequest } from '../../models/authentication-models';
import { catchError, finalize, of, switchMap, tap } from 'rxjs';
import { MatTabsModule } from '@angular/material/tabs';
@Component({
  selector: 'app-login',
  imports: [
    MatTabsModule, ReactiveFormsModule, MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterLink
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);
  private router = inject(Router);
  private toastService = inject(ToastService);
  private captchaService = inject(CaptchaService);
  readonly purpose = 'login' as const;

  // UI 状态
  showPassword = signal(false);
  logging = signal(false);

  readonly codeTTL = 60;

  // 表单
  passwordForm = this.fb.group({
    account: ['', [Validators.required]],
    password: ['', [Validators.required]]
  });

  smsForm = this.fb.group({
    phone: ['', [Validators.required, Validators.pattern(/^1\d{10}$/)]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
  });

  // ===== 密码登录 =====
  async loginWithPassword(): Promise<void> {
    if (this.passwordForm.invalid) {
      this.passwordForm.markAllAsTouched();
      return;
    }
    const { account, password } = this.passwordForm.value;

    this.logging.set(true);
  }

  // 发送短信按钮状态
  sending = signal(false);
  countdown = signal(0);
  get canSend() { return computed(() => !this.sending() && this.countdown() === 0); }

  async sendCode() {
    const phoneCtrl = this.smsForm.controls.phone;
    if (phoneCtrl.invalid) {
      phoneCtrl.markAsTouched();
      this.toastService.showAlert('请输入有效的手机号');
      return;
    }

    this.sending.set(true); // 在获取验证码/调用接口整个过程内置为 true

    try {
      // 你的 CaptchaService 是 Promise 风格
      const captchaToken = await this.captchaService.verify();

      // ✅ 显式体现 SendSmsRequest 类型
      const payload: SendSmsRequest = {
        phone: phoneCtrl.value!,   // 保证是 string
        purpose: this.purpose,
        captchaToken
      };

      // 用 subscribe + finalize（确保成功/失败都能关掉 loading）
      this.authenticationService.sendSms(payload).pipe(
        finalize(() => this.sending.set(false))
      ).subscribe({
        next: res => {
          // 你的 sendSms() 返回 { ok: boolean }
          if (!res) {
            this.toastService.showAlert('发送验证码失败，请稍后重试');
            return;
          }
          this.toastService.showSuccess('验证码已发送');
          Utilities.startCountdown(this.countdown, 60);
        },
        error: err => {
          this.toastService.showAlert(Utilities.handleError(err));
        }
      });
    } catch (e: any) {
      // Captcha 验证抛错会走这里（不会触发上面的 finalize），需要手动关掉 loading
      this.sending.set(false);
      this.toastService.showAlert(Utilities.handleError(e));
    }
  }

  loginWithSms(): void {
    if (this.smsForm.invalid) {
      this.smsForm.markAllAsTouched();
      return;
    }
    const { phone, code } = this.smsForm.value!;

    this.logging.set(true);

    this.authenticationService.loginWithSms({
      phone: phone!.trim(),
      code: code!.trim()
    }).pipe(
      // 成功后跳转到 '/'
      tap(() => this.router.navigate(['/'])),

      catchError((err) => {
        const desc = err?.error?.error_description
          || err?.message
          || '验证码错误或已过期';
        this.smsForm.controls.code.setErrors({ server: desc });
        return of(null);
      }),
      finalize(() => this.logging.set(false))
    )
      .subscribe();
  }
}
