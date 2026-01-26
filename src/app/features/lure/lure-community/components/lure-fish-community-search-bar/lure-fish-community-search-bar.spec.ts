import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureFishCommunitySearchBar } from './lure-fish-community-search-bar';

describe('LureFishCommunitySearchBar', () => {
  let component: LureFishCommunitySearchBar;
  let fixture: ComponentFixture<LureFishCommunitySearchBar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureFishCommunitySearchBar]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureFishCommunitySearchBar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
