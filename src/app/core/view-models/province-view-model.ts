import { CityViewModel } from "./city-view-model";

export class ProvinceViewModel {
  constructor() {
    this.id = 0;

    this.code = null;

    this.name = null;

    this.shortName = null;

    this.level = 0;

    this.isDirectCity = false;

    this.sortOrder = 0;

    this.isEnabled = null;

    this.createdBy = null;

    this.createdDate = new Date();

    this.updatedBy = null;

    this.updatedDate = null;

    this.cities = [];
  }

  public id: number;

  public code: string | null;

  public name: string | null;

  public shortName: string | null;

  public level: number;

  public isDirectCity: boolean;

  public sortOrder: number;

  public isEnabled: boolean | null;

  public createdBy: string | null;

  public createdDate: Date;

  public updatedBy: string | null;

  public updatedDate: Date | null;

  public cities: CityViewModel[];
}
