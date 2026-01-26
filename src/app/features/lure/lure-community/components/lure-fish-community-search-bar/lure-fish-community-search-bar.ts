import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-lure-fish-community-search-bar',
  imports: [MatButtonModule, ReactiveFormsModule, MatInputModule,  MatIconModule, MatFormFieldModule,],
  templateUrl: './lure-fish-community-search-bar.html',
  styleUrl: './lure-fish-community-search-bar.scss',
})
export class LureFishCommunitySearchBar {
    private fb = inject(FormBuilder);
  form = this.fb.nonNullable.group({
    keyword: '' 
  });
  clearKeyword() {
    this.form.controls.keyword.setValue('');
    this.onSearch();
  }
  onSearch() {

  }
  openAdvancedFilter() {
    // this.sidenav.open();
  }

}
