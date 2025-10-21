import { Component, inject, signal } from '@angular/core';
import { LoginRequest } from '../../models/LoginRequest';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule ,MatIconModule, MatFormFieldModule, MatInputModule, MatButtonModule 
  ],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  private fb = inject(FormBuilder);
  showPassword = signal(false);

  form = this.fb.nonNullable.group({
    account: ['', Validators.required],
    password: ['', Validators.required]
  });

  onSubmit() {
    debugger
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    const dto = this.form.getRawValue(); // { account, password }
    // TODO: 在这里调用你的 Auth 服务 进行登录
    console.log('login dto:', dto);
  }
}
