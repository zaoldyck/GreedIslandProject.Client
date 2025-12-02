// lure-fish-species.service.ts
import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { PagedResult } from '../../models/common-models';
import { LureFishSpeciesSearchRequest } from '../../models/lure/lure-fish-species-models';
import { LureFishSpecyViewModel } from '../../view-models/Lure-Fish-Specy-View-Model';

@Injectable({ providedIn: 'root' })
export class LureFishSpeciesService {
  private http = inject(HttpClient);
  private base = '/api/lurefishspecies'; // 或 '/api/lure/species'

  search(req: LureFishSpeciesSearchRequest): Observable<PagedResult<LureFishSpecyViewModel>> {
    return this.http.post<PagedResult<LureFishSpecyViewModel>>(`${this.base}/search`, req);
  }
}
