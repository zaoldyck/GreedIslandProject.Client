import { Component, ViewEncapsulation } from '@angular/core';
import { TopNav } from '../../shared/top-nav/top-nav';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [TopNav, RouterOutlet],
 
  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
}
