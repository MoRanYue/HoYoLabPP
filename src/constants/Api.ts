export type NumberId = string | number

export type InterfaceType = 'application' | 'web'

export enum HoyolabApiReturnCode {
  success = 0,
  needVerification = 1034
}

export enum HoyolabParentForum {
  '崩坏3' = 1,
  '原神' = 2,
  '崩坏学园2' = 3,
  '未定事件簿' = 4,
  '综合' = 5,
  '崩坏：星穹铁道' = 6,
  '绝区零' = 8
}

export const hoyolabParentForum: Record<HoyolabParentForum & number, keyof typeof HoyolabParentForum> = {
  1: '崩坏3',
  2: '原神',
  3: '崩坏学园2',
  4: '未定事件簿',
  5: '综合',
  6: '崩坏：星穹铁道',
  8: '绝区零'
}

export enum RecordGameId {
  genshinImpact,
  honkaiStarRail,
  honkai3,
}

export enum GenshinImpactRegion {
  cn_gf01,
  cn_qd01
}
export enum HonkaiStarRailRegion {
  prod_gf_cn,
  prod_qd_cn
}
export enum Honkai3Region {
  pc01
}
export type GameAccountRegion = keyof typeof GenshinImpactRegion | keyof typeof HonkaiStarRailRegion | keyof typeof Honkai3Region