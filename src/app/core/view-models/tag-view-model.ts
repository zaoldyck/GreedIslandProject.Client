export class TagViewModel {
  constructor() {
    this.id = 0;

    this.typeId = null;

    this.code = null;

    this.name = null;

    this.icon = null;

    this.color = null;

    this.sortOrder = 0;

    this.isEnabled = null;

    this.typeColor = null;

    this.lureCommunityTopicTagMapsCount = 0;
  }

  public id: number;

  public typeId: number | null;

  public code: string | null;

  public name: string | null;

  public icon: string | null;

  public color: string | null;

  public sortOrder: number;

  public isEnabled: boolean | null;

  public typeColor: string | null;

  public lureCommunityTopicTagMapsCount: number;
}
