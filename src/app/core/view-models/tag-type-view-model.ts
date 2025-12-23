import { TagViewModel } from "./tag-view-model";

export class TagTypeViewModel {
  constructor() {
    this.id = 0;

    this.code = null;

    this.name = null;

    this.description = null;

    this.iconUrl = null;

    this.color = null;

    this.sortOrder = 0;

    this.isEnabled = null;

    this.tags = [];
  }

  public id: number;

  public code: string | null;

  public name: string | null;

  public description: string | null;

  public iconUrl: string | null;

  public color: string | null;

  public sortOrder: number;

  public isEnabled: boolean | null;

  public tags: TagViewModel[];
}
