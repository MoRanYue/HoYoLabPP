<script setup lang="ts">
import type { GameRecordDataItem } from '@/constants/IGameRecordDataItem';

const props = withDefaults(defineProps<{
  data: GameRecordDataItem[]
  title?: string
}>(), {})
</script>

<template>
  <div class="game-record-data">
    <div class="title" v-if="props.title">
      <span>{{ props.title }}</span>
    </div>

    <ul>
      <li v-for="(item, i) in props.data" :key="i">
        <span class="value">{{ item.value }}</span>
        <span class="desc">{{ item.desc }}</span>
      </li>
    </ul>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#game-record-data() {
  radius: #border-radius()[medium];
  list-item-radius: #border-radius()[small];
  title-padding: 0.3em 0.45em;
  list-padding: 0.35em;
  list-item-padding: 0.25em 0.4em;
  title-font-size: 1.2rem;
  title-letter-spacing: 0.4rem;
  list-item-desc-letter-spacing: 0.15rem;
  list-item-value-top-bottom-margin: 0.7em;
  list-item-value-font-size: 1.13rem;
  list-item-interval: 0.4em;
}
#dark-game-record-data() {
  bg-color: lighten(#dark()[primary], 14%);
  list-item-bg-color: lighten(#dark()[secondary], 3%);
  title-color: darken(#dark-text()[color], 5%);
  list-item-value-color: lighten(#dark-text()[important], 17%);
}

.game-record-data {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: flex-start;

  > .title {
    border-radius: #game-record-data()[radius];
    background-color: #dark-game-record-data()[bg-color];
    padding: #game-record-data()[title-padding];
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;

    > span {
      letter-spacing: #game-record-data()[title-letter-spacing];
      font-size: #game-record-data()[title-font-size];
      margin-left: #game-record-data()[title-letter-spacing];
      color: #dark-game-record-data()[title-color];
    }
  }

  > ul {
    border-radius: #game-record-data()[radius];
    background-color: #dark-game-record-data()[bg-color];
    padding: #game-record-data()[list-padding];
    border-top-left-radius: 0;
    list-style: none;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    gap: #game-record-data()[list-item-interval];

    > li {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;
      align-items: center;
      background-color: #dark-game-record-data()[list-item-bg-color];
      padding: #game-record-data()[list-item-padding];
      border-radius: #game-record-data()[list-item-radius];

      .value {
        margin: #game-record-data()[list-item-value-top-bottom-margin] 0;
        font-size: #game-record-data()[list-item-value-font-size];
        font-weight: 750;
        color: #dark-game-record-data()[list-item-value-color];
      }
      .desc {
        letter-spacing: #game-record-data()[list-item-desc-letter-spacing];
        margin-left: #game-record-data()[list-item-desc-letter-spacing];
      }
    }
  }
}

</style>