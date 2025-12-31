export interface ModuleTagTypeMapper {
  moduleCode: string;
  tagTypeCodes: string[]; // 关联的标签类型 CODE 列表
}

export const moduleTagTypeMappers: ModuleTagTypeMapper[] = [
  {
    moduleCode: 'LUREFISHSPECIES',
    tagTypeCodes: ['SEASON', 'ACTIVE_TIME']
  },
  {
    moduleCode: 'LUREBAITTYPE',
    tagTypeCodes: ['BAIT_CATEGORY', 'DEPTH']
  }
]
