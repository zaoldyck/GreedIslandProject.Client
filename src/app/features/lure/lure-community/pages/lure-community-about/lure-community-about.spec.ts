import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityAbout } from './lure-community-about';

describe('LureCommunityAbout', () => {
  let component: LureCommunityAbout;
  let fixture: ComponentFixture<LureCommunityAbout>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityAbout]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityAbout);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
