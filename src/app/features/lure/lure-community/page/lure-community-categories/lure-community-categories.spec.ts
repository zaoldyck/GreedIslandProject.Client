import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityCategories } from './lure-community-categories';

describe('LureCommunityCategories', () => {
  let component: LureCommunityCategories;
  let fixture: ComponentFixture<LureCommunityCategories>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityCategories]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityCategories);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
