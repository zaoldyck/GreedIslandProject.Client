import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../core/services/authentication-service';
import { NgTemplateOutlet } from '@angular/common';
import { MatButton, MatIconButton } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-top-nav',
  imports: [MatButton, MatIconButton, MatIconModule, NgTemplateOutlet],
  templateUrl: './top-nav.html',
  styleUrl: './top-nav.scss'
})
export class TopNav {
  private authenticationService = inject(AuthenticationService);
  isUserLoggedIn = false;
  ngOnInit() {
    this.isUserLoggedIn = true;
  }
  logout() {

  }
}
