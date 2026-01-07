import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityLatest } from './lure-community-latest';

describe('LureCommunityLatest', () => {
  let component: LureCommunityLatest;
  let fixture: ComponentFixture<LureCommunityLatest>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityLatest]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityLatest);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
