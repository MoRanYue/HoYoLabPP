<script setup lang="ts">
import { richText } from '@/utils/richTextProcessor';
import { computed, ref, type CSSProperties, type Ref, onMounted, watch } from 'vue';

const props = withDefaults(defineProps<{
  name: string
  icon: string
  desc: string
  active: boolean
  pos?: number
}>(), {
})

const desc = ref(props.desc)

const element = ref<HTMLElement>()
async function init() {
  if (props.active) {
    element.value!.setAttribute('active', '')
  }
  else {
    element.value!.removeAttribute('active')
  }

  desc.value = await richText(props.desc)
}
onMounted(init)
watch(props, init)

</script>

<template>
  <div class="game-record-genshin-impact-constellation-item" ref="element">
    <div class="header">
      <div class="icon">
        <img :src="props.icon" :alt="props.name" :title="props.name">
      </div>

      <div class="text">
        <span>{{ props.name }}</span>
      </div>

      <div class="pos" v-if="props.pos">
        <span>{{ props.pos }}</span>
      </div>
    </div>

    <div class="desc">
      <span v-html="desc"></span>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#game-record-genshin-impact-constellation-item() {
  radius: #border-radius()[medium];
  padding: 0.4em 0.55em;
  icon-size: 3em;
  icon-border: 1px solid #dark-game-record-genshin-impact-constellation-item()[icon-border-color];
  name-padding: 0.2em 0.3em;
  name-right-top-radius: #border-radius()[large];
  header-interval: 0.7em;
}
#dark-game-record-genshin-impact-constellation-item() {
  bg-color: lighten(#dark()[secondary], 3%);
  active-bg-color: lighten(#dark()[secondary], 15%);
  name-bg-color: lighten(#dark()[secondary], 7%);
  name-color: darken(#dark()[content], 13%);
  icon-border-color: darken(#dark()[sub], 20%);
}

.game-record-genshin-impact-constellation-item {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  background-color: #dark-game-record-genshin-impact-constellation-item()[bg-color];
  border-radius: #game-record-genshin-impact-constellation-item()[radius];
  padding: #game-record-genshin-impact-constellation-item()[padding];

  &[active] {
    background-color: #dark-game-record-genshin-impact-constellation-item()[active-bg-color];
  }

  .header {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    margin-bottom: #game-record-genshin-impact-constellation-item()[header-interval];

    .text {
      background-color: #dark-game-record-genshin-impact-constellation-item()[name-bg-color];
      padding: #game-record-genshin-impact-constellation-item()[name-padding];
      border-top-right-radius: #game-record-genshin-impact-constellation-item()[name-right-top-radius];
      
      span {
        color: #dark-game-record-genshin-impact-constellation-item()[name-color];
      }
    }

    .icon {
      height: #game-record-genshin-impact-constellation-item()[icon-size];
      border-radius: #border-radius()[circle];
      overflow: hidden;
      border: #game-record-genshin-impact-constellation-item()[icon-border];

      img {
        width: 100%;
        height: 100%;
        display: block;
      }
    }

    .pos {
      flex-grow: 1;
      text-align: right;
    }
  }

  .desc {
    flex-grow: 1;
  }
}

</style>