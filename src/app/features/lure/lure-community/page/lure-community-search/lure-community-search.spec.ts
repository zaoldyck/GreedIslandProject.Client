import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunitySearch } from './lure-community-search';

describe('LureCommunitySearch', () => {
  let component: LureCommunitySearch;
  let fixture: ComponentFixture<LureCommunitySearch>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunitySearch]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunitySearch);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
