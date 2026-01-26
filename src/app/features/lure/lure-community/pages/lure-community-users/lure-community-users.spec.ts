import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityUsers } from './lure-community-users';

describe('LureCommunityUsers', () => {
  let component: LureCommunityUsers;
  let fixture: ComponentFixture<LureCommunityUsers>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityUsers]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityUsers);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
