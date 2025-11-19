import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../core/services/authentication-service';
import { NgTemplateOutlet } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  imports: [RouterLinkActive,RouterLink,MatButton, MatIconButton, MatIconModule, NgTemplateOutlet],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.scss'
})
export class TopNav {
  public authenticationService = inject(AuthenticationService);
  private router = inject(Router);
 
  ngOnInit() {
  
  }
  logout() {
    this.authenticationService.logout().subscribe({
      next: () => {
        // 任选其一
        this.router.navigateByUrl('/login');
        // 或者强制刷新确保所有内存状态清空
        // location.href = '/';
      }
    });
  }
}
