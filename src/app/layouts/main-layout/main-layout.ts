import { Component, ViewEncapsulation } from '@angular/core';
import { Shell } from '../../shared/shell/shell';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-main-layout',
  imports: [Shell],

  templateUrl: './main-layout.html',
  styleUrl: './main-layout.scss'
})
export class MainLayout {
}
