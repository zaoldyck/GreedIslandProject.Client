import { Component, ElementRef, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSlideToggleChange, MatSlideToggleModule } from '@angular/material/slide-toggle';
import { LureBaitTypeService } from '../../../lure-bait-type/lure-bait-type-service';
import { CommonService } from '../../../../../core/services/common-service';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Utilities } from '../../../../../core/utils/utilities';
import { EMPTY, exhaustMap, Subject, takeUntil, tap } from 'rxjs';
import { LureBaitTypeViewModel } from '../../../../../core/view-models/lure-bait-type-view-model';
import { PagedResult } from '../../../../../core/models/common-models';
import { TagViewModel } from '../../../../../core/view-models/tag-view-model';
import { LureBaitTypeSearchRequest } from '../../../../../core/models/lure/lure-bait-type-models';
import { TagSelectDialog } from '../../../../../shared/tag-select-dialog/tag-select-dialog';
import { MatchMode, TagSelectDialogData, TagSelectResult } from '../../../../../shared/tag-select-dialog/tag-select-dialog-data';
import { AsyncPipe, Location } from '@angular/common';
import { LureCommunityService } from '../lure-community-service';
import { LureCommunitySearchBar } from '../../components/lure-community-search-bar/lure-community-search-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
@Component({
  selector: 'app-lure-community-categories',
  imports: [MatTooltipModule,RouterLink, AsyncPipe, LureCommunitySearchBar, MatSlideToggleModule, MatButtonModule, ReactiveFormsModule, MatInputModule, MatChipsModule, MatIconModule, MatFormFieldModule, MatAutocompleteModule, MatProgressSpinnerModule, MatRippleModule, MatListModule, MatCardModule],
  templateUrl: './lure-community-categories.html',
  styleUrl: './lure-community-categories.scss',
})
export class LureCommunityCategories {
  private lureCommunityService = inject(LureCommunityService);

  /** 原始数据流 */
  readonly categories$ = this.lureCommunityService.getLureCommunityCategories();
}
