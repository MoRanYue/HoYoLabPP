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