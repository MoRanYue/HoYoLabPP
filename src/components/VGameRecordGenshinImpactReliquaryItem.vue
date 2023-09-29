<script setup lang="ts">
import VInfoShow from './VInfoShow.vue';
import { type ReliquaryEquipmentPosition } from '@/constants/GameRecordGenshinImpact';
import { richText } from '@/utils/richTextProcessor';
import { computed, ref, type CSSProperties, type Ref, onMounted, watch } from 'vue';

const props = withDefaults(defineProps<{
  name: string
  icon: string
  rarity: number
  level: number
  pos: keyof typeof ReliquaryEquipmentPosition
  setName: string
}>(), {
})


const reliquaryEquipmentPosition: Record<keyof typeof ReliquaryEquipmentPosition, string> = {
  flowerOfLife: '生之花',
  plumeOfDeath: '死之羽',
  circletOfLogos: '理之冠',
  gobletOfEonothem: '空之杯',
  sandsOfEon: '时之沙'
}

</script>

<template>
  <div class="game-record-genshin-impact-reliquary-item" ref="element">
    <div class="header">
      <div class="icon">
        <img :src="props.icon" :alt="props.name" :title="props.name">
      </div>

      <div class="text">
        <span class="name">{{ props.name }}</span>
        <span class="set-name">{{ props.setName }}</span>
      </div>

      <div class="pos" v-if="props.pos">
        <span>{{ reliquaryEquipmentPosition[props.pos] }}</span>
      </div>
    </div>

    <div class="data">
      <ul>
        <li><v-info-show title="稀有度" :info="props.rarity"></v-info-show></li>
        <li><v-info-show title="等级" :info="props.level"></v-info-show></li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#game-record-genshin-impact-reliquary-item() {
  radius: #border-radius()[medium];
  padding: 0.4em 0.55em;
  icon-size: 4em;
  icon-radius: #border-radius()[large];
  icon-border: 1px solid #dark-game-record-genshin-impact-reliquary-item()[icon-border-color];
  text-padding: 0.2em 0.3em;
  text-radius: #border-radius()[large];
  text-item-interval: 0.2em;
  header-interval: 0.7em;
  data-item-interval: 0.5em;
  pos-interval: 0.4em;
  pos-font-size: 0.9rem;
  set-name-font-size: 0.8rem;
}
#dark-game-record-genshin-impact-reliquary-item() {
  bg-color: lighten(#dark()[secondary], 5%);
  text-bg-color: lighten(#dark()[secondary], 12%);
  name-color: darken(#dark()[content], 8%);
  set-name-color: lighten(#dark-text()[disabled], 20%);
  icon-border-color: darken(#dark()[sub], 24%);
}

.game-record-genshin-impact-reliquary-item {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  background-color: #dark-game-record-genshin-impact-reliquary-item()[bg-color];
  border-radius: #game-record-genshin-impact-reliquary-item()[radius];
  padding: #game-record-genshin-impact-reliquary-item()[padding];

  .header {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    margin-bottom: #game-record-genshin-impact-reliquary-item()[header-interval];

    .text {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: flex-start;
      gap: #game-record-genshin-impact-reliquary-item()[text-item-interval];
      
      span {
        background-color: #dark-game-record-genshin-impact-reliquary-item()[text-bg-color];
        padding: #game-record-genshin-impact-reliquary-item()[text-padding];
        border-top-right-radius: #game-record-genshin-impact-reliquary-item()[text-radius];
        border-bottom-left-radius: #game-record-genshin-impact-reliquary-item()[text-radius];
      }

      .name {
        color: #dark-game-record-genshin-impact-reliquary-item()[name-color];
      }

      .set-name {
        font-size: #game-record-genshin-impact-reliquary-item()[set-name-font-size];
        color: #dark-game-record-genshin-impact-reliquary-item()[set-name-color];
      }

    }

    .icon {
      height: #game-record-genshin-impact-reliquary-item()[icon-size];
      border-radius: #game-record-genshin-impact-reliquary-item()[icon-radius];
      overflow: hidden;
      border: #game-record-genshin-impact-reliquary-item()[icon-border];

      img {
        width: 100%;
        height: 100%;
        display: block;
      }
    }

    .pos {
      flex-grow: 1;
      text-align: right;
      margin-left: #game-record-genshin-impact-reliquary-item()[pos-interval];
      font-size: #game-record-genshin-impact-reliquary-item()[pos-font-size];
    }
  }

  .data {
    flex-grow: 1;

    > ul {
      list-style: none;
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      gap: #game-record-genshin-impact-reliquary-item()[data-item-interval];
    }
  }
}

</style>