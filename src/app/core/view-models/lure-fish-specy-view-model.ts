import { LureFishSpeciesTagMapViewModel } from "./lure-fish-species-tag-map-view-model";

export class LureFishSpecyViewModel {
  constructor() {
    this.id = 0;

    this.name = null;

    this.scientificName = null;

    this.description = null;

    this.imageUrl = null;

    this.sortOrder = 0;

    this.isEnabled = null;

    this.createdBy = null;

    this.createdDate = new Date();

    this.updatedBy = null;

    this.updatedDate = null;

    this.lureFishSpeciesTagMaps = [];
  }

  public id: number;

  public name: string | null;

  public scientificName: string | null;

  public description: string | null;

  public imageUrl: string | null;

  public sortOrder: number;

  public isEnabled: boolean | null;

  public createdBy: string | null;

  public createdDate: Date;

  public updatedBy: string | null;

  public updatedDate: Date | null;

  public lureFishSpeciesTagMaps: LureFishSpeciesTagMapViewModel[];
}
