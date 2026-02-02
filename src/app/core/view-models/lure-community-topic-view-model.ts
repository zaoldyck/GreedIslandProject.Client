import { LureCommunityTopicTagMapViewModel } from "./lure-community-topic-tag-map-view-model";

export class LureCommunityTopicViewModel {
  constructor() {
    this.id = 0;

    this.categoryId = 0;

    this.title = null;

    this.content = null;

    this.authorId = 0;

    this.authorName = null;

    this.status = 0;

    this.isPinned = false;

    this.isFeatured = false;

    this.replyCount = 0;

    this.viewCount = 0;

    this.lastReplyUserId = null;

    this.lastReplyDate = null;

    this.isEnabled = null;

    this.lureCommunityTopicTagMaps = [];
  }

  public id: number;

  public categoryId: number;

  public title: string | null;

  public content: string | null;

  public authorId: number;

  public authorName: string | null;

  public status: number;

  public isPinned: boolean;

  public isFeatured: boolean;

  public replyCount: number;

  public viewCount: number;

  public lastReplyUserId: number | null;

  public lastReplyDate: Date | null;

  public isEnabled: boolean | null;

  public lureCommunityTopicTagMaps: LureCommunityTopicTagMapViewModel[];
}
