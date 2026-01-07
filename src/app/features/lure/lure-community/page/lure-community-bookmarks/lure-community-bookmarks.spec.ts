import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityBookmarks } from './lure-community-bookmarks';

describe('LureCommunityBookmarks', () => {
  let component: LureCommunityBookmarks;
  let fixture: ComponentFixture<LureCommunityBookmarks>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityBookmarks]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityBookmarks);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
