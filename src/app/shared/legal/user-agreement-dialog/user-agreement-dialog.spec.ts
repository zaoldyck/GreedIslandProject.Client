import { ComponentFixture, TestBed } from '@angular/core/testing';

import { UserAgreementDialog } from './user-agreement-dialog';

describe('UserAgreementDialog', () => {
  let component: UserAgreementDialog;
  let fixture: ComponentFixture<UserAgreementDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserAgreementDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(UserAgreementDialog);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
