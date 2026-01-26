import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityBadges } from './lure-community-badges';

describe('LureCommunityBadges', () => {
  let component: LureCommunityBadges;
  let fixture: ComponentFixture<LureCommunityBadges>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityBadges]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityBadges);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
