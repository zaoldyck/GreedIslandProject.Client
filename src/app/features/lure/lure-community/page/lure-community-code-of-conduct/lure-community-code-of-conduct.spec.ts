import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityCodeOfConduct } from './lure-community-code-of-conduct';

describe('LureCommunityCodeOfConduct', () => {
  let component: LureCommunityCodeOfConduct;
  let fixture: ComponentFixture<LureCommunityCodeOfConduct>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityCodeOfConduct]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityCodeOfConduct);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
