import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { MatSidenavModule } from '@angular/material/sidenav';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-lure-community-shell',
  imports: [MatButtonModule,MatListModule, RouterLinkActive, RouterLink, MatIconModule, MatSidenavModule,RouterOutlet],
  templateUrl: './lure-community-shell.html',
  styleUrl: './lure-community-shell.scss',
})
export class LureCommunityShell implements OnInit {

  readonly collapsed = signal<boolean>(false);
 
  ngOnInit(): void {
  
  }
 
  onExpand(): void { this.collapsed.set(false); }
  onCollapse(): void { this.collapsed.set(true); }
 
}
