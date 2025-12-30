import { TagViewModel } from "./tag-view-model";

export class LureBaitTypeTagMapViewModel {
  constructor() {
    this.baitTypeId = 0;

    this.tagId = 0;

    this.isEnabled = null;

    this.priority = 0;

    this.notes = null;

    this.tag = new TagViewModel();
  }

  public baitTypeId: number;

  public tagId: number;

  public isEnabled: boolean | null;

  public priority: number;

  public notes: string | null;

  public tag: TagViewModel;
}
