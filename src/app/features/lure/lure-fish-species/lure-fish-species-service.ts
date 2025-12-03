import { inject, Injectable } from '@angular/core';
import { PagedResult } from '../../../core/models/common-models';
import { LureFishSpeciesSearchRequest } from '../../../core/models/lure/lure-fish-species-models';
import { LureFishSpecyViewModel } from '../../../core/view-models/lure-fish-specy-view-model';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class LureFishSpeciesService {
  private http = inject(HttpClient);
  private base = '/api/lurefishspecies';

  search(req: LureFishSpeciesSearchRequest): Observable<PagedResult<LureFishSpecyViewModel>> {
    return this.http.post<PagedResult<LureFishSpecyViewModel>>(`${this.base}/search`, req);
  }
}
