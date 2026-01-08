import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityGroups } from './lure-community-groups';

describe('LureCommunityGroups', () => {
  let component: LureCommunityGroups;
  let fixture: ComponentFixture<LureCommunityGroups>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityGroups]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityGroups);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
