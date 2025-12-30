import { inject, Injectable } from '@angular/core';
import { PagedResult } from '../../../core/models/common-models';

import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { LureBaitTypeViewModel } from '../../../core/view-models/lure-bait-type-view-model';
import { LureBaitTypeSearchRequest } from '../../../core/models/lure/lure-bait-type-models';

@Injectable({
  providedIn: 'root'
})
export class LureBaitTypeService {
  private http = inject(HttpClient);
  private base = '/api/lurebaittype';

  search(req: LureBaitTypeSearchRequest): Observable<PagedResult<LureBaitTypeViewModel>> {
    return this.http.post<PagedResult<LureBaitTypeViewModel>>(`${this.base}/search`, req);
  }

  /** 按 id 获取详情；后端未找到时返回 null（200 OK） */
  getLureBaitTypeById(id: number): Observable<LureBaitTypeViewModel | null> {
    return this.http.get<LureBaitTypeViewModel | null>(`${this.base}/${id}`);
  }
}
