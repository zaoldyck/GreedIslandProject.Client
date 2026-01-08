 
import { Component,   inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
 

@Component({
  selector: 'app-auth-wall',
  imports: [RouterLink,MatIconModule, MatButtonModule],
  templateUrl: './auth-wall.html',
  styleUrls: ['./auth-wall.scss'],
})
export class AuthWall {
 
  readonly router = inject(Router);
 
}
