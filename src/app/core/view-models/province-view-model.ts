import { CityViewModel } from "./city-view-model";

export class ProvinceViewModel {
  constructor() {
    this.id = null;

    this.code = null;

    this.name = null;

    this.shortName = null;

    this.level = 0;

    this.isDirectCity = false;

    this.sortOrder = 0;

    this.cities = [];
  }

  public id: string | null;

  public code: string | null;

  public name: string | null;

  public shortName: string | null;

  public level: number;

  public isDirectCity: boolean;

  public sortOrder: number;

  public cities: CityViewModel[];
}
