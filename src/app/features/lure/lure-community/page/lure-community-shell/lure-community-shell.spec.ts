import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LureCommunityShell } from './lure-community-shell';

describe('LureCommunityShell', () => {
  let component: LureCommunityShell;
  let fixture: ComponentFixture<LureCommunityShell>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LureCommunityShell]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LureCommunityShell);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
