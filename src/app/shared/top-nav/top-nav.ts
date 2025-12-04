
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { AuthenticationService } from '../../core/services/authentication-service';

// Angular Material（standalone）
import { MatIconModule } from '@angular/material/icon';
 
import {   MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatDividerModule } from '@angular/material/divider';

@Component({
  selector: 'app-top-nav',
  standalone: true,
  templateUrl: './top-nav.html',
  styleUrls: ['./top-nav.scss'], // 注意这里用 styleUrls（数组），而不是 styleUrl
  imports: [
    // Router（若本组件里使用 <router-outlet> 就保留 RouterOutlet，否则可移除）
    RouterLinkActive, RouterLink, RouterOutlet,
 
    MatIconModule,
    MatButtonModule,  
    MatSidenavModule,                // ★ 必须：提供 <mat-sidenav-container>/<mat-sidenav>/<mat-sidenav-content>
    MatListModule,                   // 菜单列表（<mat-nav-list>/<a mat-list-item>）
    MatDividerModule,
  ],
})
export class TopNav {
  public authenticationService = inject(AuthenticationService);
  public router = inject(Router);

  logout() {
    this.authenticationService.logout().subscribe({
      next: () => this.router.navigateByUrl('/'),
    });
  }
}
