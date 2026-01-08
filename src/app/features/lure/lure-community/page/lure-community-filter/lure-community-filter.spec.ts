import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityFilter } from './lure-community-filter';

describe('LureCommunityFilter', () => {
  let component: LureCommunityFilter;
  let fixture: ComponentFixture<LureCommunityFilter>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityFilter]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityFilter);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
