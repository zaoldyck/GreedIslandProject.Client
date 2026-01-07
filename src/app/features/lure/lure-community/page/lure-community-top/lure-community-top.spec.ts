import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityTop } from './lure-community-top';

describe('LureCommunityTop', () => {
  let component: LureCommunityTop;
  let fixture: ComponentFixture<LureCommunityTop>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityTop]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityTop);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
