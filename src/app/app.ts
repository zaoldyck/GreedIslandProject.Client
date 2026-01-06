import { Component, signal, inject, OnInit, PLATFORM_ID } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Toast } from './core/toast/components/toast/toast';
import { CommonService } from './core/services/common-service';
import { ProgressBar } from './layouts/progress-bar/progress-bar';
import { isPlatformBrowser } from '@angular/common';
import { MatIconRegistry } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  imports: [ProgressBar, RouterOutlet, Toast],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App implements OnInit {
  protected isBrowser = isPlatformBrowser(inject(PLATFORM_ID));
  protected readonly title = signal('greedislandproject.client');
  private commonService = inject(CommonService);

  constructor(iconRegistry: MatIconRegistry) {
    iconRegistry.setDefaultFontSetClass('material-symbols-outlined');
  }

  ngOnInit() {
 
  }
}
