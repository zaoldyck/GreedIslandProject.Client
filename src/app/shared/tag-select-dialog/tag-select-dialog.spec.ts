import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TagSelectDialog } from './tag-select-dialog';

describe('TagSelectDialog', () => {
  let component: TagSelectDialog;
  let fixture: ComponentFixture<TagSelectDialog>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TagSelectDialog]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TagSelectDialog);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
