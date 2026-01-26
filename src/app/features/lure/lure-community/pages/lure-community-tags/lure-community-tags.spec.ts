import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityTags } from './lure-community-tags';

describe('LureCommunityTags', () => {
  let component: LureCommunityTags;
  let fixture: ComponentFixture<LureCommunityTags>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityTags]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityTags);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
