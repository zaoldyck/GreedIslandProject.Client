import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityCategoryDetail } from './lure-community-category-detail';

describe('LureCommunityCategoryDetail', () => {
  let component: LureCommunityCategoryDetail;
  let fixture: ComponentFixture<LureCommunityCategoryDetail>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityCategoryDetail]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityCategoryDetail);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
