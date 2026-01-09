import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityTagDetail } from './lure-community-tag-detail';

describe('LureCommunityTagDetail', () => {
  let component: LureCommunityTagDetail;
  let fixture: ComponentFixture<LureCommunityTagDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityTagDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityTagDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
