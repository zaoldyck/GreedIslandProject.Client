import { Component, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { CommonService } from '../../core/services/common-service';
@Component({
  selector: 'app-footer',
  imports: [MatIconModule, MatButtonModule],
  templateUrl: './footer.html',
  styleUrl: './footer.scss',
})
export class Footer {
    public commonService = inject(CommonService);
  readonly year = new Date().getFullYear();

  scrollToTop() {
    if (typeof window !== 'undefined') {
      this.commonService.scrollToTop('smooth');
    }
  }

}
