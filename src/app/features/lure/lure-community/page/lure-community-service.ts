import { inject, Injectable } from '@angular/core';

import { Observable, shareReplay } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LureCommunityCategoryViewModel } from '../../../../core/view-models/lure-community-category-view-model';

@Injectable({
  providedIn: 'root'
})
export class LureCommunityService {
  private http = inject(HttpClient);
  private base = '/api/lurecommunity';

  getLureCommunityCategories(): Observable<LureCommunityCategoryViewModel[]> {
    return this.http.get<LureCommunityCategoryViewModel[]>(`${this.base}/categories`)
      .pipe(shareReplay(1));
  }
}
