<script setup lang="ts">
import { gameRecordCard, genshinImpactAccountCharacterInfo, genshinImpactAccountMainInfo, userInfo } from '@/api/interfaces';
import { useUserStore } from '@/stores/user';
import VUserAnchor from '@/components/VUserAnchor.vue';
import VSwitch from '@/components/VSwitch.vue';
import VGameRecordData from '@/components/VGameRecordData.vue';
import VGameRecordCharacterSlot from '@/components/VGameRecordCharacterSlot.vue';
import VVerificationView from '@/components/VVerificationView.vue';
import VInfoShow from '@/components/VInfoShow.vue';
import VGameRecordGenshinImpactConstellationItem from '@/components/VGameRecordGenshinImpactConstellationItem.vue';
import VGameRecordGenshinImpactReliquaryItem from '@/components/VGameRecordGenshinImpactReliquaryItem.vue'
import type { SwitchInfo } from '@/constants/TSwitchInfo';
import { ref, watch, type Ref, onMounted, getCurrentInstance } from 'vue';
import type { UserAnchorInfo } from '@/constants/IUserAnchorInfo';
import { useRoute, useRouter } from 'vue-router';
import { type GenshinImpactRegion, type HonkaiStarRailRegion, type Honkai3Region, type GameAccountRegion, type NumberId, type RecordGameId, HoyolabApiReturnCode } from '@/constants/Api';
import { notify } from '@/utils/notification';
import { toValue } from '@vueuse/core';
import { reliquaryEquipmentPosition, ReliquaryEquipmentPosition } from '@/constants/GameRecordGenshinImpact';
import { toPercentStr } from '@/utils/utils';

const route = useRoute()
const router = useRouter()

const user = useUserStore()

const inst = getCurrentInstance()

const needValidate = ref(false)

const recordGameName: Record<keyof typeof RecordGameId, {
  name: string
  icon: string
}> = {
  genshinImpact: {name: '原神', icon: 'https://www.miyoushe.com/_nuxt/img/game-ys.dfc535b.jpg'},
  honkaiStarRail: {name: '崩坏：星穹铁道', icon: 'https://www.miyoushe.com/_nuxt/img/game-sr.4f80911.jpg'},
  honkai3: {name: '崩坏3', icon: 'https://www.miyoushe.com/_nuxt/img/game-bh3.abe5ead.jpg'}
}

const gameAccounts: Ref<{
  nickname: string
  game: keyof typeof RecordGameId
  region: GameAccountRegion
  level: number
  id: NumberId
  items: {
    name: string
    value: string
  }[]
}[]> = ref([])
const userAnchorInfo: Ref<UserAnchorInfo & {self: boolean}> = ref({
  self: false,
  avatar: '',
  nickname: '',
  userId: 0
})

function getRegionName(region: GameAccountRegion) {
  switch (region) {
    case 'cn_gf01':
    case 'prod_gf_cn':
      return '官方服务器'
    
    case 'cn_qd01':
    case 'prod_qd_cn':
      return '渠道服务器'
  
    default:
      return '未知'
  }
}

async function getAccounts() {
  if (route.params.gameId && route.params.gameUserId) {
    userAnchorInfo.value.self = false
    return
  }
  else {
    if (!user.loggedIn) {
      notify('尚未登录', undefined, 'error')
      router.push('/user')
      return
    }

    const userInfoRes = await userInfo(user.accountId, 'web')
    if (userInfoRes.retcode != 0) {
      return
    }

    const userInfoData = userInfoRes.data.user_info

    userAnchorInfo.value.self = true
    userAnchorInfo.value.avatar = userInfoData.avatar_url
    userAnchorInfo.value.nickname = userInfoData.nickname
    userAnchorInfo.value.userId = userInfoData.uid
  }

  const recordCard = await gameRecordCard(user.accountId, user.chooseStoken(), user.accountId, user.mihoyoId)
  if (recordCard.retcode != 0) {
    return
  }

  recordCard.data.list.forEach(account => {
    let game: keyof typeof RecordGameId
    switch (account.game_id) {
      case 1:
        game = 'honkai3'
        break;

      case 2:
        game = 'genshinImpact'
        break;
      
      case 6:
        game = 'honkaiStarRail'
        break;
    
      default:
        return
    }

    gameAccounts.value.push({
      game,
      region: account.region,
      level: account.level,
      id: account.game_role_id,
      nickname: account.nickname,
      items: account.data
    })
  });
}
watch(() => route.params, getAccounts)
onMounted(getAccounts)

const currentGame = ref<keyof typeof RecordGameId>()
const currentAccountId: Ref<NumberId> = ref(0)

enum CharacterElement {
  '冰' = 'Cryo',
  '风' = 'Anemo',
  '火' = 'Pyro',
  '草' = 'Dendro',
  '雷' = 'Electro',
  '岩' = 'Geo',
  '水' = 'Hydro'
}
const genshinImpactCharacterElement: Record<CharacterElement, keyof typeof CharacterElement> = {
  Cryo: '冰',
  Anemo: '风',
  Dendro: '草',
  Electro: '雷',
  Hydro: '水',
  Pyro: '火',
  Geo: '岩'
}
interface GenshinSpiralAbyssCharacterRankItem {
  id: NumberId
  icon: string
  value: number | string
  rarity: number
}
interface ReliquaryEquipmentItem {
  id: NumberId
  name: string
  icon: string
  rarity: number
  level: number
  set: {
    id: NumberId
    name: string
    effects: {
      activationCount: number
      desc: string
    }[]
  }
  pos: keyof typeof ReliquaryEquipmentPosition
}
interface GenshinImpactCharacterInfo {
  id: NumberId
  name: string
  image: string
  icon: string
  favorability: number
  element: CharacterElement
  rarity: number
  activeConstellation: number
  level: number
  weapon: {
    id: NumberId
    name: string
    icon: string
    rarity: number
    level: number
    refiningTime: number
    breakthroughTime: number
    type: string
    desc: string
  }
  reliquaries: ReliquaryEquipmentItem[]
  constellations: {
    id: NumberId
    name: string
    icon: string
    desc: string
    active: boolean
    pos: number
  }[]
  costumes: {
    id: NumberId
    name: string
    icon: string
  }[]
}
const genshinImpactRecordInfo = ref<Partial<{
  account: {
    nickname: string
    level: number
    region: GameAccountRegion
    regionServerName?: string
    userId: NumberId
    avatar: string
  }
  main: {
    activeDay: number
    achievement: number
    avatar: number
    teleportationPoint: number
    domain: number
    spiralAbyss: string
    oculi: {
      anemoculus: number
      geoculus: number
      electroculus: number
      dendroculus: number
      hydroculus: number
    }
    chest: {
      precious: number
      luxurious: number
      exquisite: number
      common: number
      magic: number
    }
  }
  worlds: {
    id: NumberId
    name: string
    icon: string
    reputationLevel: number
    explorationDegree: number
    areas: {
      name: string
      explorationDegree: number
    }[]
    bosses: {
      name: string
      killingTime: number
    }[]
    otherAvailableItems: {
      name: string
      icon: string
      level: number
    }[]
  }[]
  characters: GenshinImpactCharacterInfo[]
  homes: {
    level: number
    visitor: number
    blueprint: number
    islands: {
      name: string
      icon: string
      adeptalEnergy: number
      adeptalEnergyBadge: string
      adeptalEnergyIcon: string
    }[]
  }
  spiralAbyss: {
    id: NumberId
    startTime: number
    endTime: number
    totalBattleTime: number
    totalWonTime: number
    theDeepestPlace: string
    isUnlocked: boolean
    characterUsingFrequencyRank: GenshinSpiralAbyssCharacterRankItem[]
    characterDefeatRank: GenshinSpiralAbyssCharacterRankItem[]
    characterDamageRank: GenshinSpiralAbyssCharacterRankItem[]
    characterTookDamageRank: GenshinSpiralAbyssCharacterRankItem[]
    characterUsingElementalSkillRank: GenshinSpiralAbyssCharacterRankItem[]
    characterUsingElementalBurstRank: GenshinSpiralAbyssCharacterRankItem[]
    floors: {
      pos: number
      isPassed: boolean
      gotStar: number
      maxStar: number
      rooms: {
        pos: number
        gotStar: number
        maxStar: number
        sessions: {
          pos: 'firstHalf' | 'secondHalf'
          startTime: number
          usingAvatars: {
            id: NumberId
            icon: string
            level: number
            rarity: number
          }[]
        }
      }[]
    }[]
  }[]
}>>()
const genshinImpactCurrentCharacterInfo = ref<GenshinImpactCharacterInfo>()

const genshinImpactDetailsElement = ref<HTMLElement>()
// watch(genshinImpactDetailsElement, element => {
//   if (!element) {
//     return
//   }

//   console.log(element.querySelectorAll('div.character > ul > li'))
// })

async function viewGameRecord(gameAccountId: NumberId, accountRegion: GameAccountRegion, recordGameId: keyof typeof RecordGameId) {
  currentAccountId.value = gameAccountId
  genshinImpactRecordInfo.value = undefined

  if (recordGameId == 'genshinImpact') {
    const mainInfo = await genshinImpactAccountMainInfo(gameAccountId, <keyof typeof GenshinImpactRegion>accountRegion, user.chooseLtoken(), user.accountId, user.mihoyoId)
    if (mainInfo.retcode == HoyolabApiReturnCode.needVerification) {
      needValidate.value = true
      return
    }
    
    const accountInfo = mainInfo.data.role
    const basicInfo = mainInfo.data.stats

    genshinImpactRecordInfo.value = {
      account: {
        nickname: accountInfo.nickname,
        region: accountRegion,
        regionServerName: getRegionName(accountRegion) + ' - “' + accountInfo.region + '”',
        level: accountInfo.level,
        userId: gameAccountId,
        avatar: accountInfo.game_head_icon
      },
      main: {
        achievement: basicInfo.achievement_number,
        activeDay: basicInfo.active_day_number,
        avatar: basicInfo.avatar_number,
        spiralAbyss: basicInfo.spiral_abyss,
        domain: basicInfo.domain_number,
        teleportationPoint: basicInfo.way_point_number,
        chest: {
          common: basicInfo.common_chest_number,
          exquisite: basicInfo.exquisite_chest_number,
          luxurious: basicInfo.luxurious_chest_number,
          magic: basicInfo.magic_chest_number,
          precious: basicInfo.precious_chest_number
        },
        oculi: {
          anemoculus: basicInfo.anemoculus_number,
          geoculus: basicInfo.geoculus_number,
          electroculus: basicInfo.electroculus_number,
          dendroculus: basicInfo.dendroculus_number,
          hydroculus: basicInfo.hydroculus_number
        }
      },
      characters: [],
      worlds: []
    }
    mainInfo.data.world_explorations.forEach(nation => {
      const areas: {
        name: string
        explorationDegree: number
      }[] = []
      nation.area_exploration_list.forEach(area => {
        areas.push({
          name: area.name,
          explorationDegree: area.exploration_percentage / 1000
        })
      });
      const bosses: {
        name: string
        killingTime: number
      }[] = []
      nation.boss_list.forEach(boss => {
        bosses.push({
          name: boss.name,
          killingTime: boss.kill_num
        })
      });
      const otherAvailableItems: {
        name: string
        icon: string
        level: number
      }[] = []
      nation.offerings.forEach(item => {
        otherAvailableItems.push({
          name: item.name,
          icon: item.icon,
          level: item.level
        })
      });
      
      genshinImpactRecordInfo.value!.worlds!.push({
        name: nation.name,
        id: nation.id,
        reputationLevel: nation.level,
        icon: nation.icon,
        areas,
        bosses,
        explorationDegree: nation.exploration_percentage / 1000,
        otherAvailableItems
      })
    });

    const avatarInfo = await genshinImpactAccountCharacterInfo(gameAccountId, accountRegion, user.chooseLtoken(), user.accountId, user.mihoyoId)
    avatarInfo.data.avatars.forEach(avatar => {
      const weaponInfo = avatar.weapon

      const i = genshinImpactRecordInfo.value!.characters!.push({
        id: avatar.id,
        name: avatar.name,
        element: avatar.element,
        favorability: avatar.fetter,
        image: avatar.image,
        icon: avatar.icon,
        rarity: avatar.rarity,
        activeConstellation: avatar.actived_constellation_num,
        level: avatar.level,
        weapon: {
          id: weaponInfo.id,
          name: weaponInfo.name,
          icon: weaponInfo.icon,
          rarity: weaponInfo.rarity,
          type: weaponInfo.type_name,
          level: weaponInfo.level,
          breakthroughTime: weaponInfo.promote_level,
          refiningTime: weaponInfo.affix_level,
          desc: weaponInfo.desc
        },
        constellations: [],
        costumes: [],
        reliquaries: []
      }) - 1

      avatar.constellations.forEach(constellation => {
        genshinImpactRecordInfo.value!.characters![i].constellations.push({
          id: constellation.id,
          name: constellation.name,
          icon: constellation.icon,
          desc: constellation.effect,
          active: constellation.is_actived,
          pos: constellation.pos
        })
      });

      avatar.costumes.forEach(costume => {
        genshinImpactRecordInfo.value!.characters![i].costumes.push({
          id: costume.id,
          name: costume.name,
          icon: costume.icon
        })
      });

      avatar.reliquaries.forEach(reliquary => {
        const j = genshinImpactRecordInfo.value!.characters![i].reliquaries.push({
          id: reliquary.id,
          name: reliquary.name,
          icon: reliquary.icon,
          rarity: reliquary.rarity,
          level: reliquary.level,
          pos: reliquaryEquipmentPosition[reliquary.pos],
          set: {
            id: reliquary.set.id,
            name: reliquary.set.name,
            effects: []
          }
        }) - 1

        reliquary.set.affixes.forEach(effect => {
          genshinImpactRecordInfo.value!.characters![i].reliquaries[j].set.effects.push({
            desc: effect.effect,
            activationCount: effect.activation_number
          })
        });
      });
    });
  }

  currentGame.value = recordGameId
}
const genshinImpactCurrentCharacterInfoReliquarySetEffects: Ref<Record<string, {
  desc: string
  activationCount: number
}[]>> = ref({})
async function viewCharacter(id: NumberId) {
  if (genshinImpactRecordInfo.value?.characters?.length == 0) {
    return
  }

  genshinImpactRecordInfo.value!.characters!.forEach(avatar => {
    if (avatar.id == id) {
      genshinImpactCurrentCharacterInfo.value = avatar
    }
  });

  genshinImpactCurrentCharacterInfoReliquarySetEffects.value = getActiveReliquarySetEffect(toValue(genshinImpactCurrentCharacterInfo)!.reliquaries)
}
function getActiveReliquarySetEffect(reliquaries: ReliquaryEquipmentItem[]) {
  const activeSetEffects: (typeof genshinImpactCurrentCharacterInfoReliquarySetEffects)['value'] = {}
  const equippedSet: Record<NumberId, {
    name: string
    equipmentNumber: number
  }> = {}

  reliquaries.forEach(reliquary => {
    const set = reliquary.set

    if (Object.prototype.hasOwnProperty.call(equippedSet, set.id)) {
      equippedSet[set.id].equipmentNumber++
    }
    else {
      equippedSet[set.id] = {
        equipmentNumber: 1,
        name: set.name
      }
    }

    const setInfo = equippedSet[set.id]

    set.effects.forEach(effect => {
      if (setInfo.equipmentNumber >= effect.activationCount) {
        if (!Object.prototype.hasOwnProperty.call(activeSetEffects, setInfo.name)) {
          activeSetEffects[setInfo.name] = []
        }
        for (let i = 0; i < activeSetEffects[setInfo.name].length; i++) {
          const effectInfo = activeSetEffects[setInfo.name][i];
          
          if (effectInfo.desc == effect.desc) {
            return
          }
        }

        activeSetEffects[setInfo.name].push({
          desc: effect.desc,
          activationCount: effect.activationCount
        })
      }
    });
  });

  return activeSetEffects
}
function genshinImpactElementIconUrl(name: CharacterElement) {
  const baseUrl = '/img/gameRecord/genshinImpact/characterElement'

  switch (name) {
    case 'Cryo':
      return `${baseUrl}/cryo.svg`
    
    case 'Anemo':
      return `${baseUrl}/anemo.svg`
    
    case 'Pyro':
      return `${baseUrl}/pyro.svg`

    case 'Geo':
      return `${baseUrl}/geo.svg`

    case 'Hydro':
      return `${baseUrl}/hydro.svg`
    
    case 'Electro':
      return `${baseUrl}/electro.svg`

    case 'Dendro':
      return `${baseUrl}/dendro.svg`
  
    default:
      return ''
  }
}
</script>

<template>
  <section v-show="needValidate">
    <v-verification-view @finish="needValidate = false; currentAccountId = 0"></v-verification-view>
  </section>
  
  <div class="game-record">
    <div class="account">
      <v-user-anchor :avatar="userAnchorInfo.avatar" :nickname="userAnchorInfo.nickname" :user-id="userAnchorInfo.userId" v-if="userAnchorInfo.self"></v-user-anchor>
      
      <ul>
        <li v-for="account in gameAccounts" :key="account.id" @click="viewGameRecord(account.id, account.region, account.game)" :select="currentAccountId == account.id">
          <div class="header">
            <div class="icon">
              <img :src="recordGameName[account.game].icon" :title="recordGameName[account.game].name" :alt="recordGameName[account.game].name">
            </div>

            <div class="text">
              <span class="nickname">{{ account.nickname }}</span>
              <span class="region">服务器：{{ getRegionName(account.region) }}</span>
              <span class="level">等级：{{ account.level }}级</span>
            </div>
          </div>

          <div class="data">
            <ul>
              <li v-for="item in account.items" :key="item.name">
                <span class="name">{{ item.name }}</span>
                <span class="value">{{ item.value }}</span>
              </li>
            </ul>
          </div>
        </li>
      </ul>
    </div>

    <section class="details">
      <div class="genshin-impact" v-if="genshinImpactRecordInfo" ref="genshinImpactDetailsElement">
        <div class="header" v-if="genshinImpactRecordInfo.account">
          <div class="avatar">
            <img :src="genshinImpactRecordInfo.account.avatar" :title="genshinImpactRecordInfo.account.userId" :alt="genshinImpactRecordInfo.account.nickname">
          </div>

          <div class="text">
            <span class="nickname">{{ genshinImpactRecordInfo.account.nickname }}</span>
            <span class="accound-id">{{ genshinImpactRecordInfo.account.userId }}</span>
            <span class="region">{{ genshinImpactRecordInfo.account.regionServerName ?? getRegionName(genshinImpactRecordInfo.account.region) }}</span>
            <span class="level">{{ genshinImpactRecordInfo.account.level }}级</span>
          </div>
        </div>
        
        <div class="main" v-if="genshinImpactRecordInfo.main">
          <span class="title">主要</span>

          <div class="basic">
            <v-game-record-data title="概略信息" :data="[
              {desc: '活跃日', value: genshinImpactRecordInfo.main.activeDay},
              {desc: '解锁成就', value: genshinImpactRecordInfo.main.achievement},
              {desc: '拥有角色', value: genshinImpactRecordInfo.main.avatar},
              {desc: '深境螺旋', value: genshinImpactRecordInfo.main.spiralAbyss},
              {desc: '解锁传送锚点', value: genshinImpactRecordInfo.main.teleportationPoint},
              {desc: '解锁秘境入口', value: genshinImpactRecordInfo.main.domain}
            ]"></v-game-record-data>
          </div>

          <div class="chest">
            <v-game-record-data title="宝箱收集信息" :data="[
              {desc: '普通的宝箱', value: genshinImpactRecordInfo.main.chest.common},
              {desc: '精致的宝箱', value: genshinImpactRecordInfo.main.chest.exquisite},
              {desc: '珍贵的宝箱', value: genshinImpactRecordInfo.main.chest.precious},
              {desc: '华丽的宝箱', value: genshinImpactRecordInfo.main.chest.luxurious},
              {desc: '奇馈宝箱', value: genshinImpactRecordInfo.main.chest.magic}
            ]"></v-game-record-data>
          </div>

          <div class="oculi">
            <v-game-record-data title="神瞳收集信息" :data="[
              {desc: '风神瞳', value: genshinImpactRecordInfo.main.oculi.anemoculus},
              {desc: '岩神瞳', value: genshinImpactRecordInfo.main.oculi.geoculus},
              {desc: '雷神瞳', value: genshinImpactRecordInfo.main.oculi.electroculus},
              {desc: '草神瞳', value: genshinImpactRecordInfo.main.oculi.dendroculus},
              {desc: '水神瞳', value: genshinImpactRecordInfo.main.oculi.hydroculus}
            ]"></v-game-record-data>
          </div>
        </div>

        <div class="world" v-if="genshinImpactRecordInfo.worlds">
          <span class="title">世界探索</span>

          <ul>
            <li v-for="nation in genshinImpactRecordInfo.worlds" :key="nation.id">
              <div class="nation-name">
                <img :src="nation.icon" :alt="nation.name" :title="nation.name">
                <span>{{ nation.name }}</span>
              </div>

              <div class="data">
                <div class="basic">
                  <span class="title">主要</span>

                  <ul>
                    <li><v-info-show title="探索度" :info="toPercentStr(nation.explorationDegree)"></v-info-show></li>
                    <li><v-info-show title="声望等级" :info="`${nation.reputationLevel}级`"></v-info-show></li>
                  </ul>
                </div>

                <div class="area" v-if="nation.areas.length != 0">
                  <span class="title">地区探索度</span>

                  <ul>
                    <li v-for="area in nation.areas" :key="area.name">
                      <v-info-show :title="area.name" :desc="area.name" :info="toPercentStr(area.explorationDegree)"></v-info-show>
                    </li>
                  </ul>
                </div>

                <div class="boss" v-if="nation.bosses.length != 0">
                  <span class="title">世界首领怪物击杀次数</span>

                  <ul>
                    <li v-for="boss in nation.bosses" :key="boss.name">
                      <v-info-show :title="boss.name" :desc="boss.name" :info="`${boss.killingTime}次`"></v-info-show>
                    </li>
                  </ul>
                </div>

                <div class="other-item" v-if="nation.otherAvailableItems.length != 0">
                  <span class="title">其它项</span>

                  <ul>
                    <li v-for="item in nation.otherAvailableItems" :key="item.name">
                      <v-info-show :title="item.name" :desc="item.name" :info="`${item.level}级`"></v-info-show>
                    </li>
                  </ul>
                </div>
              </div>
            </li>
          </ul>
        </div>

        <div class="character" v-if="genshinImpactRecordInfo.characters?.length != 0">
          <span class="title">角色</span>
          
          <ul>
            <li v-for="character in genshinImpactRecordInfo.characters" :key="character.id">
              <v-game-record-character-slot :name="character.name" :id="character.id" :icon="character.icon" :image="character.image" 
              :background="genshinImpactElementIconUrl(character.element)" @click="viewCharacter(character.id)"></v-game-record-character-slot>
            </li>
          </ul>
        </div>

        <div class="character-details" v-if="genshinImpactCurrentCharacterInfo">
          <div class="image">
            <img class="element" :src="genshinImpactElementIconUrl(genshinImpactCurrentCharacterInfo.element)" alt="">
            <img class="image" :src="genshinImpactCurrentCharacterInfo.image" :alt="genshinImpactCurrentCharacterInfo.name">
          </div>

          <span class="dividing"></span>

          <div class="info">
            <div class="basic">
              <span class="title">基础</span>

              <ul>
                <li><v-info-show title="名称" :info="genshinImpactCurrentCharacterInfo.name"></v-info-show></li>
                <li><v-info-show title="元素" :info="genshinImpactCharacterElement[genshinImpactCurrentCharacterInfo.element]"></v-info-show></li>
                <li><v-info-show title="稀有度" :info="genshinImpactCurrentCharacterInfo.rarity"></v-info-show></li>
                <li><v-info-show title="等级" :info="genshinImpactCurrentCharacterInfo.level"></v-info-show></li>
                <li><v-info-show title="好感度" :info="genshinImpactCurrentCharacterInfo.favorability"></v-info-show></li>
                <li><v-info-show title="激活命之座数" :info="genshinImpactCurrentCharacterInfo.activeConstellation"></v-info-show></li>
              </ul>
            </div>

            <div class="constellation">
              <span class="title">命之座</span>

              <ul>
                <li v-for="constellation in genshinImpactCurrentCharacterInfo.constellations" :key="constellation.pos">
                  <v-game-record-genshin-impact-constellation-item :active="constellation.active" :name="constellation.name" 
                  :desc="constellation.desc" :icon="constellation.icon" :pos="constellation.pos"></v-game-record-genshin-impact-constellation-item>
                </li>
              </ul>
            </div>

            <div class="weapon">
              <span class="title">武器</span>

              <div class="icon">
                <img :src="genshinImpactCurrentCharacterInfo.weapon.icon">
              </div>

              <ul>
                <li><v-info-show title="名称" :info="genshinImpactCurrentCharacterInfo.weapon.name"></v-info-show></li>
                <li><v-info-show title="类型" :info="genshinImpactCurrentCharacterInfo.weapon.type"></v-info-show></li>
                <li><v-info-show title="稀有度" :info="genshinImpactCurrentCharacterInfo.weapon.rarity"></v-info-show></li>
                <li><v-info-show title="描述" :info="genshinImpactCurrentCharacterInfo.weapon.desc"></v-info-show></li>
                <li><v-info-show title="等级" :info="genshinImpactCurrentCharacterInfo.weapon.level"></v-info-show></li>
                <li><v-info-show title="突破等阶" :info="genshinImpactCurrentCharacterInfo.weapon.breakthroughTime"></v-info-show></li>
                <li><v-info-show title="精炼次数" :info="genshinImpactCurrentCharacterInfo.weapon.refiningTime"></v-info-show></li>
              </ul>
            </div>

            <div class="reliquery">
              <span class="title">圣遗物</span>

              <div class="set-effects" v-if="Object.keys(genshinImpactCurrentCharacterInfoReliquarySetEffects).length > 0">
                <ul>
                  <li v-for="(v, k) in genshinImpactCurrentCharacterInfoReliquarySetEffects" :key="k">
                    <div class="name">
                      <span>{{ k }}</span>
                    </div>

                    <ul>
                      <li v-for="(effect, i) in v" :key="i">
                        <span class="activation-count">需要{{ effect.activationCount }}个该套装的圣遗物</span>
                        <span class="desc">{{ effect.desc }}</span>
                      </li>
                    </ul>
                  </li>
                </ul>
              </div>
              <div class="have-no-set-effects" v-else>
                <span>暂无套装效果</span>
              </div>

              <ul>
                <li v-for="reliquary in genshinImpactCurrentCharacterInfo.reliquaries" :key="reliquary.pos">
                  <v-game-record-genshin-impact-reliquary-item :name="reliquary.name" :icon="reliquary.icon" 
                  :rarity="reliquary.rarity" :level="reliquary.level" :pos="reliquary.pos" :set-name="reliquary.set.name"></v-game-record-genshin-impact-reliquary-item>
                </li>
              </ul>
            </div>

            <div class="costume" v-if="genshinImpactCurrentCharacterInfo.costumes.length > 0">
              <span class="title">衣装</span>

              <ul>
                <li v-for="costume in genshinImpactCurrentCharacterInfo.costumes" :key="costume.id">
                  <div class="image">
                    <img :src="costume.icon" :title="costume.name" :alt="costume.name">
                  </div>

                  <span class="name">{{ costume.name }}</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#game-record() {
  account-selector-margin: 1.3em 0;
  account-selector-radius: #border-radius()[large];
  account-selector-padding: 0.9em 1.1em;
  user-account-interval: 1.2em;
  account-item-padding: 0.5em 0.65em;
  account-item-interval: 0.6em;
  account-item-radius: #border-radius()[medium];
  account-game-icon-size: 2rem;
  account-game-icon-radius: #border-radius()[small];
  account-game-icon-interval: 0.4em;
  account-header-line-height: 1.05rem;
  account-nickname-font-size: 1.25rem;
  account-region-font-size: 0.7rem;
  account-level-font-size: 0.8rem;
  account-data-interval: 0.5em;
  account-data-padding: 0.3em;
  account-data-item-padding: 0.5em 0.8em;
  account-data-radius: #border-radius()[medium];
  account-data-item-radius: #border-radius()[small];
  account-data-item-interval: 0.4em;
  account-data-item-name-font-size: 0.9rem;
  account-data-item-value-font-size: 1.2rem;
  account-item-transition-time: 0.25s;
  details-card-interval: 0.6em;
  details-title-interval: 0.4em;
  details-header-nickname-font-size: 2.2rem;
  details-header-account-id-font-size: 0.9rem;
  details-header-region-font-size: 1.02rem;
  details-header-level-font-size: 1.1rem;
  details-header-avatar-size: 8em;
  details-header-padding: 0.6em 1em;
  details-header-radius: #border-radius()[large-xx];
  details-main-list-interval: 0.46em;
  details-card-radius: #border-radius()[medium];
  details-main-card-padding: 0.45em;
  details-character-card-padding: 0.5em;
  details-card-title-font-size: 1.5rem;
  details-character-item-interval: 0.8em;
  details-character-details-img-height: 40em;
  details-character-details-padding: 0.95em 1em;
  details-character-details-dividing-width: 1px;
  details-character-details-item-interval: 1em;
  details-character-details-info-basic-item-interval: 0.4em;
  details-character-details-image-element-opacity: 0.5;
  details-character-details-image-radius: #border-radius()[large];
  details-character-details-image-border: 2px solid #dark-game-record()[details-character-details-image-border-color];
  details-character-details-constellation-item-interval: 0.6em;
  details-character-details-weapon-icon-size: 10em;
  details-character-details-weapon-icon-radius: #border-radius()[medium];
  details-character-details-weapon-icon-padding: 0.4em;
  details-character-details-weapon-icon-interval: 0.8em;
  details-character-details-weapon-item-interval: 0.4em;
  details-character-details-reliquary-item-interval: 0.6em;
  details-character-details-reliquery-set-effects-padding: 0.5em;
  details-character-details-reliquery-set-effects-radius: #border-radius()[medium];
  details-character-details-reliquery-set-effects-interval: 0.5em;
  details-character-details-reliquery-set-effects-item-interval: 0.7em;
  details-character-details-reliquery-set-effects-item-padding: 0.4em;
  details-character-details-reliquery-set-effects-item-radius: #border-radius()[small];
  details-character-details-reliquery-set-effects-item-border-width: 1px;
  details-character-details-reliquery-set-effects-item-border: 1px solid #dark-game-record()[details-character-details-reliquery-set-effects-item-border-color];
  details-character-details-reliquary-have-no-set-effects-font-size: 1.2rem;
  details-character-details-reliquery-set-effects-item-name-font-size: 1.2rem;
  details-character-details-reliquery-set-effects-item-name-interval: 0.3em;
  details-character-details-reliquery-set-effects-item-effect-interval: 0.2em;
  details-character-details-reliquery-set-effects-item-effect-radius: #border-radius()[tiny];
  details-character-details-reliquery-set-effects-item-effect-padding: 0.3em 0.35em;
  details-character-details-reliquery-set-effects-item-effect-activation-count-interval: 0.4em;
  details-character-details-reliquery-set-effects-item-effect-activation-count-font-size: 1.08rem;
  details-character-details-reliquery-set-effects-item-effect-desc-font-size: 0.9rem;
  details-character-details-costume-height: 25em;
  details-character-details-costume-item-interval: 0.87em;
  details-character-details-costume-item-image-radius: #border-radius()[medium];
  details-character-details-costume-item-name-interval: 0.5em;
  details-world-nation-img-height: 5em;
  details-world-padding: 0.4em 0.6em;
  details-world-nation-interval: 0.55em 0.4em;
  details-world-nation-name-padding: 0.15em;
  details-world-nation-name-radius: #border-radius()[small];
  details-world-nation-name-font-size: 1.08rem;
  details-world-data-item-interval: 0.3em;
  details-world-data-item-radius: #border-radius()[medium];
  details-world-data-item-padding: 0.2em;
  details-world-data-basic-item-interval: 0.35em;
  details-world-data-other-item-interval: 0.3em;
  details-world-data-boss-item-interval: 0.38em;
  details-world-data-area-item-interval: 0.45em;
}
#dark-game-record() {
  account-selector-bg-color: lighten(#dark()[primary], 7%);
  account-item-bg-color: lighten(#dark()[secondary], 12%);
  account-item-hover-bg-color: lighten(#dark()[secondary], 16%);
  account-item-active-bg-color: lighten(#dark()[secondary], 19%);
  account-item-select-bg-color: lighten(#dark()[secondary], 18%);
  account-nickname-color: darken(#dark-text()[color], 3%);
  account-region-color: lighten(#dark-text()[disabled], 10%);
  account-level-color: lighten(#dark-text()[disabled], 15%);
  account-data-bg-color: lighten(#dark()[primary], 4%);
  account-data-item-bg-color: darken(#dark()[primary], 1%);
  account-data-item-name-color: darken(#dark-text()[color], 2%);
  account-data-item-value-color: lighten(#dark-text()[important], 6%);
  details-header-bg-color: lighten(#dark()[secondary], 10%);
  details-header-nickname-color: lighten(#dark-text()[important], 18%);
  details-header-account-id-color: lighten(#dark-text()[disabled], 30%);
  details-header-region-color: darken(#dark-text()[color], 10%);
  details-header-level-color: darken(#dark-text()[color], 8%);
  details-header-avatar-bg-color: lighten(#dark()[secondary], 18%);
  details-main-bg-color: lighten(#dark()[secondary], 5%);
  details-character-bg-color: lighten(#dark()[secondary], 4%);
  details-character-details-bg-color: lighten(#dark()[secondary], 8%);
  details-character-details-image-border-color: darken(#dark()[sub], 30%);
  details-character-details-dividing-color: darken(#dark()[sub], 23%);
  details-character-details-weapon-icon-bg-color: lighten(#dark()[secondary], 20%);
  details-character-details-reliquery-set-effects-bg-color: lighten(#dark()[secondary], 2%);
  details-character-details-reliquery-set-effects-item-bg-color: lighten(#dark()[secondary], 15%);
  details-character-details-reliquery-set-effects-item-border-color: darken(#dark()[sub], 8%);
  details-character-details-reliquery-set-effects-item-name: darken(#dark-text()[color], 5%);
  details-character-details-reliquery-set-effects-item-effect-bg-color: lighten(#dark()[secondary], 5%);
  details-character-details-reliquery-set-effects-item-effect-activation-count-color: darken(#dark-text()[color], 10%);
  details-world-bg-color: lighten(#dark()[secondary], 6%);
  details-world-nation-name-bg-color: lighten(#dark()[secondary], 14%);
  details-world-nation-name-color: darken(#dark-text()[color], 6%);
  details-world-data-item-bg-color: fadeout(lighten(#dark()[primary], 4%), 10%);
}

.game-record {
  width: 60%;
  margin: auto;

  > .details {
    > div {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      gap: #game-record()[details-card-interval];

      > div {
        border-radius: #game-record()[details-card-radius];
        

        span.title {
          text-align: center;
          font-weight: 800;
          font-size: #game-record()[details-card-title-font-size];
          margin: #game-record()[details-title-interval] 0;
        }
      }
    }

    > .genshin-impact {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      align-items: flex-start;
      gap: #game-record()[details-card-interval];

      > .main {
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        background-color: #dark-game-record()[details-main-bg-color];
        gap: #game-record()[details-main-list-interval];
        padding: #game-record()[details-main-card-padding];
      }

      > .world {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        background-color: #dark-game-record()[details-world-bg-color];
        padding: #game-record()[details-world-padding];

        > ul {
          list-style: none;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          gap: #game-record()[details-world-nation-interval];

          > li {
            display: flex;
            flex-direction: row;
            align-items: flex-start;

            .data {
              display: flex;
              flex-direction: column;
              flex-wrap: wrap;
              align-items: flex-start;
              gap: #game-record()[details-world-data-item-interval];

              > div {
                background-color: #dark-game-record()[details-world-data-item-bg-color];
                padding: #game-record()[details-world-data-item-padding];
                border-radius: #game-record()[details-world-data-item-radius];
              }

              .other-item {
                > ul {
                  list-style: none;
                  display: flex;
                  flex-direction: row;
                  flex-wrap: wrap;
                  gap: #game-record()[details-world-data-other-item-interval];
                }
              }

              .boss {
                > ul {
                  list-style: none;
                  display: flex;
                  flex-direction: row;
                  flex-wrap: wrap;
                  gap: #game-record()[details-world-data-boss-item-interval];
                }
              }

              .area {
                > ul {
                  list-style: none;
                  display: flex;
                  flex-direction: row;
                  flex-wrap: wrap;
                  gap: #game-record()[details-world-data-area-item-interval];
                }
              }

              .basic {
                > ul {
                  list-style: none;
                  display: flex;
                  flex-direction: row;
                  flex-wrap: wrap;
                  gap: #game-record()[details-world-data-basic-item-interval];
                }
              }
            }

            .nation-name {
              padding: #game-record()[details-world-nation-name-padding];
              display: flex;
              flex-direction: column;
              align-items: center;
              background-color: #dark-game-record()[details-world-nation-name-bg-color];
              border-radius: #game-record()[details-world-nation-name-radius];

              img {
                display: block;
                height: #game-record()[details-world-nation-img-height];
              }
              span {
                color: #dark-game-record()[details-world-nation-name-color];
                font-size: #game-record()[details-world-nation-name-font-size];
                font-weight: 650;
              }
            }
          }
        }
      }

      > .character-details {
        background-color: #dark-game-record()[details-character-details-bg-color];
        padding: #game-record()[details-character-details-padding];
        // height: #game-record()[details-character-details-height];
        overflow: hidden;
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: center;
        gap: #game-record()[details-character-details-item-interval];

        .info {
          align-self: flex-start;
          flex-grow: 1;
          display: flex;
          flex-direction: column;

          > div {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
          }

          .basic {
            > ul {
              list-style: none;
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              gap: #game-record()[details-character-details-info-basic-item-interval];
            }
          }

          .constellation {
            > ul {
              list-style: none;
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              align-items: stretch;
              gap: #game-record()[details-character-details-constellation-item-interval];
            }
          }

          .costume {

            > ul {
              list-style: none;
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              justify-content: center;  
              gap: #game-record()[details-character-details-costume-item-interval];

              > li {
                display: flex;
                flex-direction: column;
                flex-wrap: nowrap;
                align-items: center;

                .image {
                  height: #game-record()[details-character-details-costume-height];
                  overflow: hidden;
                  border-radius: #game-record()[details-character-details-costume-item-image-radius];

                  img {
                    height: 100%;
                    display: block;
                  }
                }

                .name {
                  margin-top: #game-record()[details-character-details-costume-item-name-interval];
                }
              }
            }
          }

          .reliquery {

            > .have-no-set-effects {
              background-color: #dark-game-record()[details-character-details-reliquery-set-effects-bg-color];
              padding: #game-record()[details-character-details-reliquery-set-effects-padding];
              border-radius: #game-record()[details-character-details-reliquery-set-effects-radius];
              margin-bottom: #game-record()[details-character-details-reliquery-set-effects-interval];
              align-self: center;

              span {
                font-size: #game-record()[details-character-details-reliquary-have-no-set-effects-font-size];
              }
            }

            > .set-effects {
              align-self: center;
              background-color: #dark-game-record()[details-character-details-reliquery-set-effects-bg-color];
              padding: #game-record()[details-character-details-reliquery-set-effects-padding];
              border-radius: #game-record()[details-character-details-reliquery-set-effects-radius];
              margin-bottom: #game-record()[details-character-details-reliquery-set-effects-interval];

              > ul {
                list-style: none;
                display: flex;
                flex-direction: row;
                flex-wrap: wrap;
                gap: #game-record()[details-character-details-reliquery-set-effects-item-interval];

                > li {
                  position: relative;
                  padding: #game-record()[details-character-details-reliquery-set-effects-item-padding];
                  background-color: #dark-game-record()[details-character-details-reliquery-set-effects-item-bg-color];
                  border-radius: #game-record()[details-character-details-reliquery-set-effects-item-radius];

                  &::before,
                  &::after {
                    @keyframes borderFlowing {
                      from, 
                      to {
                        clip-path: inset(0 0 calc(99% - #game-record()[details-character-details-reliquery-set-effects-item-border-width]) 0);
                      }
                      25% {
                        clip-path: inset(0 calc(99% - #game-record()[details-character-details-reliquery-set-effects-item-border-width]) 0 0);
                      }
                      50% {
                        clip-path: inset(calc(99% - #game-record()[details-character-details-reliquery-set-effects-item-border-width]) 0 0 0);
                      }
                      75% {
                        clip-path: inset(0 0 0 calc(99%- #game-record()[details-character-details-reliquery-set-effects-item-border-width]));
                      }
                    }
                    // background-color: rgba(40, 40, 40, .3);

                    content: "";
                    pointer-events: none;
                    position: absolute;
                    display: block;
                    height: 100%;
                    width: 100%;
                    top: 0;
                    right: 0;
                    left: 0;
                    bottom: 0;
                    border-radius: #game-record()[details-character-details-reliquery-set-effects-item-radius];
                    border: #game-record()[details-character-details-reliquery-set-effects-item-border];
                    animation: borderFlowing 5s linear infinite;
                  }

                  .name {
                    margin-bottom: #game-record()[details-character-details-reliquery-set-effects-item-name-interval];
                    font-size: #game-record()[details-character-details-reliquery-set-effects-item-name-font-size];
                    color: #dark-game-record()[details-character-details-reliquery-set-effects-item-name];
                  }

                  > ul {
                    list-style: none;
                    display: flex;
                    flex-direction: row;
                    flex-wrap: wrap;
                    gap: #game-record()[details-character-details-reliquery-set-effects-item-effect-interval];

                    > li {
                      display: flex;
                      flex-direction: column;
                      flex-wrap: nowrap;
                      padding: #game-record()[details-character-details-reliquery-set-effects-item-effect-padding];
                      border-radius: #game-record()[details-character-details-reliquery-set-effects-item-effect-radius];
                      background-color: #dark-game-record()[details-character-details-reliquery-set-effects-item-effect-bg-color];

                      .activation-count {
                        color: #dark-game-record()[details-character-details-reliquery-set-effects-item-effect-activation-count-color];
                        font-size: #game-record()[details-character-details-reliquery-set-effects-item-effect-activation-count-font-size];
                        margin-bottom: #game-record()[details-character-details-reliquery-set-effects-item-effect-activation-count-interval];
                      }

                      .desc {
                        font-size: #game-record()[details-character-details-reliquery-set-effects-item-effect-desc-font-size];
                      }
                    }
                  }
                }
              }
            }

            > ul {
              list-style: none;
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              align-items: stretch;
              gap: #game-record()[details-character-details-reliquary-item-interval];
            }
          }

          .weapon {
            > .icon {
              align-self: center;
              height: #game-record()[details-character-details-weapon-icon-size];
              border-radius: #game-record()[details-character-details-weapon-icon-radius];
              overflow: hidden;
              margin-bottom: #game-record()[details-character-details-weapon-icon-interval];
              padding: #game-record()[details-character-details-weapon-icon-padding];
              background-color: #dark-game-record()[details-character-details-weapon-icon-bg-color];

              img {
                width: 100%;
                height: 100%;
                display: block;
              }
            }

            > ul {
              list-style: none;
              display: flex;
              flex-direction: row;
              flex-wrap: wrap;
              gap: #game-record()[details-character-details-weapon-item-interval];
            }
          }
        }

        .dividing {
          display: block;
          height: 96%;
          width: #game-record()[details-character-details-dividing-width];
          background-color: #dark-game-record()[details-character-details-dividing-color];
        }

        .image {
          border: #game-record()[details-character-details-image-border];
          border-radius: #game-record()[details-character-details-image-radius];
          height: #game-record()[details-character-details-img-height];
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;

          .element {
            opacity: #game-record()[details-character-details-image-element-opacity];
            align-self: flex-start;
            display: block;
            position: absolute;
            width: 60%;
          }

          .image {
            display: block;
            height: 100%;
          }
        }
      }

      > .character {
        background-color: #dark-game-record()[details-character-bg-color];
        padding: #game-record()[details-character-card-padding];
        display: flex;
        flex-direction: column;

        > ul {
          list-style: none;
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          justify-content: center;
          gap: #game-record()[details-character-item-interval];

          > li {
            > .game-record-character-slot {
              cursor: pointer;
            }
          }
        }
      }

      > .header {
        background-color: #dark-game-record()[details-header-bg-color];
        padding: #game-record()[details-header-padding];
        border-radius: #game-record()[details-header-radius];
        align-self: flex-start;
        display: flex;
        flex-direction: column;
        flex-wrap: wrap;
        align-items: center;

        > .text {
          display: flex;
          flex-direction: column;
          flex-wrap: nowrap;
          align-items: center;

          .nickname {
            color: #dark-game-record()[details-header-nickname-color];
            font-size: #game-record()[details-header-nickname-font-size];
            font-weight: 700;
            font-family: 'LXGW WenKai', sans-serif;
          }
          .accound-id {
            color: #dark-game-record()[details-header-account-id-color];
            font-size: #game-record()[details-header-account-id-font-size];
          }
          .region {
            color: #dark-game-record()[details-header-region-color];
            font-size: #game-record()[details-header-region-font-size];
          }
          .level {
            color: #dark-game-record()[details-header-level-color];
            font-size: #game-record()[details-header-level-font-size];
          }
        }

        > .avatar {
          background-color: #dark-game-record()[details-header-avatar-bg-color];
          overflow: hidden;
          border-radius: #border-radius()[circle];
          height: #game-record()[details-header-avatar-size];
          width: #game-record()[details-header-avatar-size];
          object-fit: contain;
          margin-right: #game-record()[account-game-icon-interval];

          img {
            width: 100%;
            height: 100%;
          }
        }
      }
    }
  }

  > .account {
    margin: #game-record()[account-selector-margin];
    border-radius: #game-record()[account-selector-radius];
    background-color: #dark-game-record()[account-selector-bg-color];
    padding: #game-record()[account-selector-padding];

    > .user-anchor {
      margin-bottom: #game-record()[user-account-interval];
    }

    > ul {
      list-style: none;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: #game-record()[account-item-interval];

      > li {
        background-color: #dark-game-record()[account-item-bg-color];
        padding: #game-record()[account-item-padding];
        border-radius: #game-record()[account-item-radius];
        transition-duration: #game-record()[account-item-transition-time];

        &[select="true"] {
          background-color: #dark-game-record()[account-item-select-bg-color];
        }

        &:hover {
          background-color: #dark-game-record()[account-item-hover-bg-color];
        }
        &:active {
          background-color: #dark-game-record()[account-item-active-bg-color];
        }

        > .data {
          > ul {
            list-style: none;
            display: flex;
            flex-direction: row;
            flex-wrap: wrap;
            background-color: #dark-game-record()[account-data-bg-color];
            padding: #game-record()[account-data-padding];
            border-radius: #game-record()[account-data-radius];
            gap: #game-record()[account-data-item-interval];

            > li {
              padding: #game-record()[account-data-item-padding];
              background-color: #dark-game-record()[account-data-item-bg-color];
              border-radius: #game-record()[account-data-item-radius];
              display: flex;
              flex-direction: column;
              align-items: center;

              .name {
                font-size: #game-record()[account-data-item-name-font-size];
                color: #dark-game-record()[account-data-item-name-color];
              }
              
              .value {
                font-size: #game-record()[account-data-item-value-font-size];
                color: #dark-game-record()[account-data-item-value-color];
                font-weight: 700;
              }
            }
          }
        }

        > .header {
          display: flex;
          flex-direction: row;
          flex-wrap: wrap;
          align-items: center;

          > .text {
            display: flex;
            flex-direction: column;
            flex-wrap: nowrap;
            line-height: #game-record()[account-header-line-height];

            .nickname {
              color: #dark-game-record()[account-nickname-color];
              font-size: #game-record()[account-nickname-font-size];
              font-weight: 800;
            }
            .region {
              color: #dark-game-record()[account-region-color];
              font-size: #game-record()[account-region-font-size];
            }
            .level {
              color: #dark-game-record()[account-level-color];
              font-size: #game-record()[account-level-font-size];
            }
          }

          > .icon {
            overflow: hidden;
            border-radius: #game-record()[account-game-icon-radius];
            height: #game-record()[account-game-icon-size];
            margin-right: #game-record()[account-game-icon-interval];

            img {
              width: 100%;
              height: 100%;
            }
          }
        }
      }
    }
  }
}

</style>