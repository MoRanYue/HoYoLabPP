export enum ReliquaryEquipmentPosition {
  flowerOfLife = 1,
  plumeOfDeath = 2,
  gobletOfEonothem = 3,
  sandsOfEon = 4,
  circletOfLogos = 5
}
export const reliquaryEquipmentPosition: Record<number, keyof typeof ReliquaryEquipmentPosition> = {
  1: 'flowerOfLife',
  2: 'plumeOfDeath',
  3: 'gobletOfEonothem',
  4: 'sandsOfEon',
  5: 'circletOfLogos'
}