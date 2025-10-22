import { Component, inject } from '@angular/core';
import { ToastService } from '../../services/ToastService';
import { NgClass } from '@angular/common';

@Component({
  selector: 'app-toast',
  imports: [NgClass],
  templateUrl: './toast.html',
  styleUrl: './toast.scss'
})
export class Toast {
  svc = inject(ToastService);
}
