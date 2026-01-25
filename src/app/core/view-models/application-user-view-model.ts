
export class ApplicationUserViewModel {
  constructor() {
    this.id = 0;
    this.userName = null;
    this.normalizedUserName = null;
    this.email = null;
    this.normalizedEmail = null;
    this.emailConfirmed = false;
    this.phoneNumber = null;
    this.phoneNumberConfirmed = false;
    this.twoFactorEnabled = false;
    this.lockoutEnd = null;
    this.lockoutEnabled = false;
    this.accessFailedCount = 0;
    this.displayName = null;
    this.avatarUrl = null;
    this.avatarObjectKey = null;
    this.isActive = false;
    this.registeredAt = new Date();
    this.registeredIp = null;
    this.lastLoginAt = null;
    this.lastLoginIp = null;
    this.loginCount = 0;
    this.preferredLanguage = null;
    this.timeZone = null;
    this.theme = null;
    this.preferredProvinceId = null;
    this.preferredCityId = null;
    this.wechatOpenId = null;
    this.wechatUnionId = null;

    // ✅ 新增：UI 派生字段（默认值）
    this.displayText = '';
    this.initials = '';
  }

  public id: number;
  public userName: string | null;
  public normalizedUserName: string | null;
  public email: string | null;
  public normalizedEmail: string | null;
  public emailConfirmed: boolean;
  public phoneNumber: string | null;
  public phoneNumberConfirmed: boolean;
  public twoFactorEnabled: boolean;
  public lockoutEnd: Date | null;
  public lockoutEnabled: boolean;
  public accessFailedCount: number;
  public displayName: string | null;
  public avatarUrl: string | null;
  public avatarObjectKey: string | null;
  public isActive: boolean;
  public registeredAt: Date;
  public registeredIp: string | null;
  public lastLoginAt: Date | null;
  public lastLoginIp: string | null;
  public loginCount: number;
  public preferredLanguage: string | null;
  public timeZone: string | null;
  public theme: string | null;
  public preferredProvinceId: string | null;
  public preferredCityId: string | null;
  public wechatOpenId: string | null;
  public wechatUnionId: string | null;

  // ✅ 新增字段
  public displayText: string;
  public initials: string;
}
