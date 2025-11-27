export class CityViewModel {
  constructor() {
    this.id = null;

    this.provinceId = null;

    this.code = null;

    this.name = null;

    this.level = 0;

    this.sortOrder = 0;

    this.isEnabled = false;

    this.createdBy = null;

    this.createdDate = new Date();

    this.updatedBy = null;

    this.updatedDate = null;
  }

  public id: string | null;

  public provinceId: string | null;

  public code: string | null;

  public name: string | null;

  public level: number;

  public sortOrder: number;

  public isEnabled: boolean;

  public createdBy: string | null;

  public createdDate: Date;

  public updatedBy: string | null;

  public updatedDate: Date | null;
}
