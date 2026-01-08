import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AuthWall } from './auth-wall';

describe('AuthWall', () => {
  let component: AuthWall;
  let fixture: ComponentFixture<AuthWall>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AuthWall]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AuthWall);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
