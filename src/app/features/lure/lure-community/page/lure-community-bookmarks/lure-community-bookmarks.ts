import { Component, inject } from '@angular/core';
import { AuthenticationService } from '../../../../../core/services/authentication-service';
import { AuthWall } from '../../../../../shared/auth-wall/auth-wall';

@Component({
  selector: 'app-lure-community-bookmarks',
  imports: [AuthWall],
  templateUrl: './lure-community-bookmarks.html',
  styleUrl: './lure-community-bookmarks.scss',
})
export class LureCommunityBookmarks {
  readonly auth = inject(AuthenticationService);
}
