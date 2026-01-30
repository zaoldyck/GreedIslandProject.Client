import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

@Component({
  selector: 'app-lure-community-search-bar',
  imports: [MatButtonModule, ReactiveFormsModule, MatInputModule, MatIconModule, MatFormFieldModule,],
  templateUrl: './lure-community-search-bar.html',
  styleUrl: './lure-community-search-bar.scss',
})
export class LureCommunitySearchBar {
  private fb = inject(FormBuilder);
  private router = inject(Router);
  form = this.fb.nonNullable.group({
    keyword: ''
  });
  clearKeyword() {
    this.form.controls.keyword.setValue('');
    this.onSearch();
  }

  onSearch() {
    const keyword = (this.form.get('keyword')?.value ?? '').trim();

    this.router.navigate(['/lure/community/search'], {
      queryParams: {
        keyword,
        openAdvanced: '1'   // ⭐ 加这一行就够了
      }
    });
  }

  openAdvancedFilter() {
    // this.sidenav.open();
  }
}
