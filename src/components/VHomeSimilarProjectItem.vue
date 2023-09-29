<script setup lang="ts">
import type { RecordGameId } from '@/constants/Api';
import { computed } from 'vue';

type SpecialGameFunction = Partial<Record<keyof typeof RecordGameId, boolean>>
type DataImportableAndExportable = Partial<{
  exportable: boolean
  exportAsTheFormatsDefinedByUigfOrg: boolean
  importable: boolean
  importTheFormatsDefinedByUigfOrg: boolean
}>
const props = withDefaults(defineProps<{
  project: string
  id: string
  desc: string
  author: string
  type: ('ios' | 'android' | 'web' | 'windows' | 'macos' | 'linux' | 'weChatMini')[]
  supportedFunctions: Partial<{
    gameRecord: Partial<{
      uploadable: boolean
      regularTowerActivity: boolean
      dailyNote: boolean
    }> & SpecialGameFunction
    drawingRecord: Partial<{
      analysis: boolean
      simulation: boolean
      uploadable: boolean
    }> & DataImportableAndExportable & SpecialGameFunction
    hoyolab: Partial<{
      articleOperation: boolean
      readArticle: boolean
      readAnnouncement: boolean
      needToLogin: boolean
      automaticSign: boolean
    }>
    calendar: Partial<{
      drawingPool: boolean
      activity: boolean
    }> & SpecialGameFunction
    planning: Partial<{
      calculated: boolean
      character: boolean
      weapon: boolean
      item: boolean
    }> & SpecialGameFunction
    gameLauncher: Partial<{
      gameAnnouncement: boolean
      switchAccount: boolean
    }> & SpecialGameFunction
    achievement: Partial<{
      analysis: boolean
      management: boolean
      uploadable: boolean
    }> & SpecialGameFunction & DataImportableAndExportable
    characterEquipment: Partial<{
      analysis: boolean
      management: boolean
      score: boolean
    }> & SpecialGameFunction
    wiki: Partial<{
      communityContent: boolean
      walkthrough: boolean
      character: boolean
      weapon: boolean
      equipment: boolean
      enemy: boolean
    }> & SpecialGameFunction
  }>
}>(), {})

const supportedPlatforms = computed(() => {
  let str: string = ''
  props.type.forEach((type, i) => {
    switch (type) {
      case 'windows':
        str += 'Windows'
        break;

      case 'macos':
        str += 'Mac OS'
        break;
      
      case 'linux':
        str += 'Linux'
        break;

      case 'web':
        str += '网页'
        break;

      case 'android':
        str += '安卓'
        break;

      case 'ios':
        str += 'iOS'
        break;

      case 'weChatMini':
        str += '微信小程序'
        break;
    
      default:
        break;
    }

    if (i != props.type.length - 1) {
      str += '、'
    }
  });
  return str
})
</script>

<template>
  <div class="similar-project-item">
    <h2>{{ props.project }}</h2>
    <h4 class="author">{{ props.author }}</h4>
    <span class="desc">{{ props.desc }}</span>

    <hr>

    <div class="functions">
      {{ props.supportedFunctions }}
      <!-- <table border="1">
        <colgroup>
          <col>
          <col span="*">
        </colgroup>

        <caption>支持功能</caption>
        
        <tr><td>支持平台</td><td colspan="2">{{ supportedPlatforms }}</td></tr>
        <tr><td rowspan="2">游戏记录</td><td rowspan="2">支持游戏</td><td rowspan="2">可上传</td></tr>
      </table> -->
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#home-similar-project-item() {
  padding: 0.5em 0.35em;
  title-font-size: 2.8rem;
  title-interval: 0.2em;
  desc-interval: 1.1em;
  author-font-size: 1.3rem;
}
#dark-home-similar-project-item() {

}

.similar-project-item {
  padding: #home-similar-project-item()[padding];
  display: flex;
  flex-direction: column;
  align-items: center;

  h2,
  .author,
  .desc {
    font-family: 'LXGW WenKai', sans-serif;
  }

  h2 {
    font-size: #home-similar-project-item()[title-font-size];
    margin-bottom: #home-similar-project-item()[title-interval];
  }

  .author {
    font-size: #home-similar-project-item()[author-font-size];
  }

  .desc {
    margin-bottom: #home-similar-project-item()[desc-interval];
  }

  .functions {
  }
}

</style>