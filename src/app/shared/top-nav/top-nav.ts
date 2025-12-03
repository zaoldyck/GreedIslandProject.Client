import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../core/services/authentication-service';
import { NgTemplateOutlet } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';

@Component({
  selector: 'app-top-nav',
  imports: [RouterLinkActive,RouterLink,MatButton,  MatIconModule  ],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.scss'
})
export class TopNav {
  public authenticationService = inject(AuthenticationService);
  public router = inject(Router);
 
  ngOnInit() {
  
  }
  logout() {
    this.authenticationService.logout().subscribe({
      next: () => {
        this.router.navigateByUrl('/');
      }
    });
  }
}
