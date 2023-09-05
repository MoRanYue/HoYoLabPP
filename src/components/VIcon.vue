<script lang="ts" setup>
import { type Dict } from "../constants/TDict";
import { IconPark } from '@icon-park/vue-next/es/all';
import * as IconParkMap from '@icon-park/vue-next/es/map'
import { toPascalCase } from '@/utils/utils';
import { createVNode, render, ref, onMounted, watch, compile } from 'vue';

const props = withDefaults(defineProps<{
  type: string
  size?: number | string
  spin?: boolean
  theme?: 'outline' | 'filled' | 'two-tone' | 'multi-color'
  fill?: string | string[]
  strokeLinecap?: 'butt' | 'round' | 'square'
  strokeLinejoin?: 'miter' | 'round' | 'bevel'
  strokeWidth?: number
  content?: boolean
}>(), {
  size: 100,
  theme: 'filled',
  spin: false,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  strokeWidth: 4,
  fill: 'currentColor',
  content: false
})

const icon = ref<HTMLElement>()

async function update(): Promise<void> {
  const params: Dict = {
    type: props.type,
    size: props.size,
    theme: props.theme,
    spin: props.spin,
    strokeLinecap: props.strokeLinecap,
    strokeLinejoin: props.strokeLinejoin,
    strokeWidth: props.strokeWidth,
    fill: props.fill,
  }

  const type = toPascalCase(props.type)
  if (IconParkMap[type]) {
    render(createVNode(IconParkMap[type], props), icon.value!)
  }
}
watch(() => props, update, { flush: 'post' })
onMounted(update)


</script>

<template>
  <div class="icon-container">
    <span class="icon" ref="icon"></span>
    <div v-show="props.content">
      <slot></slot>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#icon() {
  content-interval: 0.4em;
}
#dark-icon() {

}

.icon-container {
  display: flex;
  flex-direction: row;
  justify-content: center;
  align-items: center;
  flex-wrap: nowrap;

  > .icon {
    height: fit-content;
    width: fit-content;
  }
  > div {
    display: inline-block;
    margin-left: #icon()[content-interval];
  }
}

</style>