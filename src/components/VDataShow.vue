<script setup lang="ts">
import { toValue, type MaybeRefOrGetter, useClipboard } from '@vueuse/core';
import { onMounted, ref, CSSProperties, computed } from 'vue';
import VButton from './VButton.vue';

const props = withDefaults(defineProps<{
  data: MaybeRefOrGetter<string | number>
  desc: string
  allowOperation?: boolean
  blur?: boolean
}>(), {
  allowOperation: false,
  blur: false
})

const dataElement = ref<HTMLElement>()

const dataTextStyle = computed((): CSSProperties => {
  const style: CSSProperties = {}

  const data = toValue(dataElement)
  if (!data) {
    return style
  }

  const textLength = data.innerText.length

  for (let size = 48; size > 12; size--) {
    if (size * textLength < data.offsetWidth || size == 13) {
      style.fontSize = `${size}px`
      break
    }
  }

  if (props.blur) {
    style.filter = 'blur(10px)'
    style.userSelect = 'none'
  }

  return style
})

const clipboard = useClipboard({legacy: true})
function copy() {
  clipboard.copy(String(toValue(props.data)))
}
</script>

<template>
  <div class="data-show">
    <div class="operation" v-if="props.allowOperation && !props.blur">
      <v-button type="icon" icon="copy" title="复制" @click="copy"></v-button>
    </div>

    <span class="data" ref="dataElement" :style="dataTextStyle">{{ props.data }}</span>
    <span class="desc">{{ props.desc }}</span>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#data-show() {
  padding: 1em;
  radius: #border-radius()[large];
  operation-top: 0.3em;
  operation-right: 0.3em;
  data-font-size: 3.6rem;
  desc-line-height: 1.1rem;
}
#dark-data-show() {
  bg-color: lighten(#dark()[primary], 4%);
  data-color: darken(#dark-text()[important], 7%);
}

.data-show {
  padding: #data-show()[padding];
  background-color: #dark-data-show()[bg-color];
  border-radius: #data-show()[radius];
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: center;
  position: relative;
  // width: 18em;
  // height: 15em;

  .operation {
    position: absolute;
    top: #data-show()[operation-top];
    right: #data-show()[operation-right];
  }

  .data {
    flex-grow: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #dark-data-show()[data-color];
    font-size: #data-show()[data-font-size];
    width: 100%;
    height: 100%;
    word-wrap: break-word;
    word-break: break-all;
    overflow: hidden;
  }

  .desc {
    line-height: #data-show()[desc-line-height];
  }
}

</style>