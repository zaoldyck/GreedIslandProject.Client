import { Component, inject } from '@angular/core';
import { BreadcrumbService } from '../../core/services/breadcrumb-service';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
@Component({
  selector: 'app-breadcrumb',
  imports: [MatDividerModule,MatButtonModule,MatIconModule,RouterLink],
  templateUrl: './breadcrumb.html',
  styleUrl: './breadcrumb.scss',
})
export class Breadcrumb {
  svc = inject(BreadcrumbService);
}
