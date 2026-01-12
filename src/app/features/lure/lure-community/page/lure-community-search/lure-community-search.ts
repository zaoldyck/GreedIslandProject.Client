import { Component, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { TagViewModel } from '../../../../../core/view-models/tag-view-model';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { Constants } from '../../../../../core/constants/constants';
type SearchScope = 'topics' | 'categories' | 'users';
@Component({
  selector: 'app-lure-community-search',
  imports: [MatSelectModule,MatInputModule,MatIconModule,ReactiveFormsModule,MatFormFieldModule,MatButtonModule,MatCardModule],
  templateUrl: './lure-community-search.html',
  styleUrl: './lure-community-search.scss',
})
export class LureCommunitySearch {
  private fb = inject(FormBuilder);
  readonly constants = inject(Constants);
  form = this.fb.nonNullable.group({
    keyword: '',
    scope: this.fb.nonNullable.control<SearchScope>('topics'),
    tags: this.fb.nonNullable.control<TagViewModel[]>([]),
    matchMode: 'AND', // ✅ 用字面量类型，默认 OR
  });
  // 快速链接折叠状态：默认展开（false 表示未折叠）
  readonly advancedOptionCollapsed = signal<boolean>(true);
  /** 外部检索（自动重置并拉取） */
  onSearch() {
 
  }
  clearKeyword() {
    this.form.controls.keyword.setValue('');
  }
  toggleAdvancedOptions(): void {
    this.advancedOptionCollapsed.update(v => !v);
  }
}
