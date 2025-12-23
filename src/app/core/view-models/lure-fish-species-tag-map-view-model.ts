import { TagViewModel } from "./tag-view-model";
 
export class LureFishSpeciesTagMapViewModel {
  constructor() {
    this.speciesId = 0;

    this.tagId = 0;

    this.isEnabled = null;

    this.tag = new TagViewModel();
  }

  public speciesId: number;

  public tagId: number;

  public isEnabled: boolean | null;

  public tag: TagViewModel;
}
