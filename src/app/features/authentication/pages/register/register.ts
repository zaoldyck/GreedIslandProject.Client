import { ChangeDetectorRef, Component, computed, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, ReactiveFormsModule, ValidationErrors, ValidatorFn, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ToastService } from '../../../../core/toast/services/toast-service';
import { AuthenticationService } from '../../../../core/services/authentication-service';
import { NgClass } from '@angular/common';
import { MatStepper, MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { UserAgreementDialog } from '../../../../shared/legal/user-agreement-dialog/user-agreement-dialog';
import { CaptchaService } from '../../../../core/services/captcha-service';
import { distinctUntilChanged, finalize, firstValueFrom, startWith, switchMap, take } from 'rxjs';
 
import { Utilities } from '../../../../core/utils/utilities';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterModule } from '@angular/router';
import { SendSmsRequest, VerifySmsRequest } from '../../../../core/models/authentication-models';
import { CompleteRegisterRequest } from '../../../../core/models/register-models';
import { MatCardModule } from '@angular/material/card';
 

const CN_PHONE = /^1[3-9]\d{9}$/;                         // 大陆手机号 11 位

@Component({
  selector: 'app-register',
  imports: [MatCardModule,RouterModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, MatStepperModule, MatCheckboxModule, MatDialogModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register implements OnInit {
  private cdr = inject(ChangeDetectorRef);
  private fb = inject(FormBuilder);
  private authenticationService = inject(AuthenticationService);
  private toastService = inject(ToastService);
  private dialog = inject(MatDialog);
  private captchaService = inject(CaptchaService);
  private destroyRef = inject(DestroyRef);
  readonly purpose = 'register' as const; // 或 'login' as const

  // 第一步：手机号 + 短信码
  phoneForm = this.fb.nonNullable.group({
    phone: ['', [Validators.required, Validators.pattern(CN_PHONE)]],
    code: ['', [Validators.required, Validators.pattern(/^\d{6}$/)]],
    agreement: [false, Validators.requiredTrue] // 新增：必须勾选
  });

  // 可选密码强度：空值通过；有值时要求 ≥8 + 数字 + 小写
  optionalPasswordStrength: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const v = (control.value ?? '') as string;
    if (!v) return null; // 允许不填密码
    const hasMinLen = v.length >= 8;
    const hasDigit = /\d/.test(v);
    const hasLower = /[a-z]/.test(v);
    return hasMinLen && hasDigit && hasLower ? null : { passwordWeak: true };
  };

  // 表单级一致性：两边都有值时才比较
  optionalPasswordMatch: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const group = control as FormGroup;
    const pwd = (group.get('password')?.value ?? '') as string;
    const cfm = (group.get('confirmPassword')?.value ?? '') as string;
    if (!pwd || !cfm) return null; // 没有同时填写就不报不一致
    return pwd === cfm ? null : { passwordMismatch: true };
  };

  // 第二步：个人信息（密码可选）
  profileForm = this.fb.nonNullable.group({
    displayName: [''],
    email: ['', [Validators.email]],
    password: ['', [this.optionalPasswordStrength]],
    confirmPassword: [''],
  }, { validators: this.optionalPasswordMatch });

  // 一次性注册票据（由后端颁发）
  verificationTicket = signal<string | null>(null);
  loading = signal(false);
  // 发送短信按钮状态
  sending = signal(false);
  countdown = signal(0);

  get canSend() { return computed(() => !this.sending() && this.countdown() === 0); }

  ngOnInit(): void {
    const passwordCtrl = this.profileForm.controls.password;
    const confirmPasswordCtrl = this.profileForm.controls.confirmPassword;

    passwordCtrl.valueChanges.pipe(
      startWith(passwordCtrl.value),
      distinctUntilChanged(),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe(v => {
      if (v) {
        confirmPasswordCtrl.addValidators(Validators.required);
      } else {
        confirmPasswordCtrl.removeValidators(Validators.required);
        confirmPasswordCtrl.setValue('');
        confirmPasswordCtrl.markAsPristine();
        confirmPasswordCtrl.markAsUntouched();
      }
      confirmPasswordCtrl.updateValueAndValidity({ emitEvent: false });
      this.profileForm.updateValueAndValidity({ emitEvent: false });
    });
  }

  async sendCode() {
    const phoneCtrl = this.phoneForm.controls.phone;
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

  confirmAgreementAndNext(stepper: MatStepper): void {
    // 自动勾选协议
    if (!this.phoneForm.controls.agreement.value) {
      this.phoneForm.controls.agreement.setValue(true);
      this.phoneForm.controls.agreement.markAsDirty();
    }

    if (this.phoneForm.invalid) {
      this.phoneForm.markAllAsTouched();
      return;
    }

    const { phone, code } = this.phoneForm.getRawValue() as { phone: string; code: string };
    const request: VerifySmsRequest = { phone: (phone ?? '').trim(), code: (code ?? '').trim(), purpose: this.purpose };

    this.loading.set(true);

    this.authenticationService.verifySms(request)
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: res => {
          if (res.success) {
            // 兼容后端返回大小写差异：RegisterTicket vs verificationTicket
            const verificationTicket = res.verificationTicket;

            if (!verificationTicket) {
              // 理论上成功一定应有票据；若后端未来允许“仅验证不签发”，这里防御处理
              this.phoneForm.controls.code.setErrors({ server: '验证成功，但未签发票据，请稍后重试' });
              return;
            }

            this.verificationTicket.set(verificationTicket);

            stepper.next();
          } else {
            const msg = Utilities.mapSmsCodeReason(res.reason);
            this.phoneForm.controls.code.setErrors({ server: msg });
          }
        },
        error: () => {
          this.phoneForm.controls.code.setErrors({ server: '网络错误，请稍后重试' });
        }
      });
  }

  submitting = signal(false);

  complete(stepper: MatStepper) {
    const ticket = this.verificationTicket();
    if (!ticket) {
      this.toastService.showAlert('请先完成手机号验证');
      return;
    }

    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      this.toastService.showAlert('请修正表单错误后再提交');
      return;
    }

    this.submitting.set(true);
    const { displayName, email, password } = this.profileForm.getRawValue() as {
      displayName: string;
      email: string;
      password: string;
    };

    const req: CompleteRegisterRequest = {
      verificationTicket: ticket,
      displayName: displayName || null,
      email: email || null,
      password: password || null,
      autoLogin: false // 如需注册即登录，改为 true
    };

    this.authenticationService.completeRegister(req)
      .pipe(finalize(() => this.submitting.set(false)))
      .subscribe({
        next: (res) => {
          if (res.ok) {
            // 清除一次性票据，避免重复提交
            this.verificationTicket.set(null);

            stepper.next();
            this.toastService.showSuccess('注册成功');

            // 你可以根据 userId / isNew 做后续逻辑
            // if (req.autoLogin) { 刷新/跳转 … }
          } else {
            // 后端若可能返回 ok=false（非异常），这里兜底
            this.toastService.showAlert('注册失败，请稍后再试');
          }
        },
        error: (err) => {
          const backend = err.error;
          const msg =
            backend?.message ||
            (typeof backend === 'string' ? backend : '注册失败，请稍后再试');
          this.toastService.showAlert(msg);
        }
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
