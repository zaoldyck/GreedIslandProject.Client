import { Component } from '@angular/core';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
@Component({
  selector: 'app-user-agreement-dialog',
  imports: [MatButtonModule,MatIconModule, MatDialogModule],
  templateUrl: './user-agreement-dialog.html',
  styleUrl: './user-agreement-dialog.scss'
})
export class UserAgreementDialog {
  constructor(
    private dialogRef: MatDialogRef<UserAgreementDialog>, // 注入 MatDialogRef
  
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }

}
