export class LureCommunityCategoryViewModel {
  constructor() {
    this.id = 0;

    this.code = null;

    this.name = null;

    this.description = null;

    this.icon = null;

    this.color = null;

    this.sortOrder = 0;

    this.isEnabled = null;

    this.lureCommunityTopicsCount = 0;
  }

  public id: number;

  public code: string | null;

  public name: string | null;

  public description: string | null;

  public icon: string | null;

  public color: string | null;

  public sortOrder: number;

  public isEnabled: boolean | null;

  public lureCommunityTopicsCount: number;
}
