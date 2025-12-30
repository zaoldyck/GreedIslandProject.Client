import { LureBaitTypeTagMapViewModel } from "./lure-bait-type-tag-map-view-model";

export class LureBaitTypeViewModel {
  constructor() {
    this.id = 0;

    this.name = null;

    this.englishName = null;

    this.imageUrl = null;

    this.slug = null;

    this.sortOrder = 0;

    this.description = null;

    this.actionIntensity = 0;

    this.depthCoverage = 0;

    this.castingDistance = 0;

    this.antiSnag = 0;

    this.hookupRate = 0;

    this.durability = 0;

    this.skillEase = 0;

    this.priceToValue = 0;

    this.isEnabled = null;

    this.lureBaitTypeTagMaps = [];
  }

  public id: number;

  public name: string | null;

  public englishName: string | null;

  public imageUrl: string | null;

  public slug: string | null;

  public sortOrder: number;

  public description: string | null;

  public actionIntensity: number;

  public depthCoverage: number;

  public castingDistance: number;

  public antiSnag: number;

  public hookupRate: number;

  public durability: number;

  public skillEase: number;

  public priceToValue: number;

  public isEnabled: boolean | null;

  public lureBaitTypeTagMaps: LureBaitTypeTagMapViewModel[];
}
