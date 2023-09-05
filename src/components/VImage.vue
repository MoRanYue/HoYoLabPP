<script setup lang="ts">
import { useAttrs, ref, type Ref, unref } from 'vue';
import VButton from './VButton.vue';
import { useIntersectionObserver, useCounter, useBrowserLocation } from '@vueuse/core';
import { getUrlObj } from '@/utils/utils';
import VLoading from './VLoading.vue';
import { useImage } from '@vueuse/core';
import { useMotion } from '@vueuse/motion';

const props = withDefaults(defineProps<{
  largeView?: boolean
  showDesc?: boolean
  priority?: 'high' | 'low' | 'auto'
  lazyLoading?: boolean
  crossSite?: boolean
  src: string
  alt?: string
}>(), {
  src: '',
  alt: '图片',
  largeView: false,
  showDesc: true,
  priority: 'auto',
  lazyLoading: true,
  crossSite: false
})

const attrs = useAttrs()
const width: string = <string>attrs.width + 'px' ?? 'fit-content'
const height: string = <string>attrs.height + 'px' ?? 'fit-content'

const oUrl: URL | undefined = getUrlObj(props.src)

let isLoading: Ref<boolean> = ref(true)
let isReady: Ref<boolean> = ref(false)
let error: Ref<unknown> = ref(null)
let { count, inc, reset } = useCounter(0, {min: 0})

function fetchImage() {
  if (isReady.value === true) {
    return
  }

  const { isLoading: l, isReady: r, error: e } = useImage({src: props.src})
  isLoading = l
  isReady = r
  error = e
  if (e) {
    inc()
  }
  else {
    reset()
  }
}

const target = ref<HTMLElement>()
const image = ref<HTMLElement>()
if (props.lazyLoading) {
  fetchImage()
}
else {
  fetchImage()
}

const targetAnimation = useMotion(target, {
  initial: {
    opacity: 0, 
    scale: 1
  },
  visible: {
    opacity: 1,
  }
})

</script>

<template>
  <figure class="image" ref="target">
    <img v-if="isReady" ref="image" :loading="lazyLoading ? 'lazy' : 'eager'"
      :src="props.src" :alt="alt"
      :referrerpolicy="props.crossSite || useBrowserLocation().value.origin != oUrl?.origin ? 'strict-origin-when-cross-origin' : 'origin'" :fetchpriority="priority"
      decoding="auto">

    <v-loading v-if="isLoading" type="three-wire-surround"></v-loading>
    <div v-else-if="error" class="error">
      <span v-if="alt">
        {{ alt }}
      </span>
      <span v-else>
        <slot></slot>
      </span>

      <br>
      <span>重试次数：{{ count }}</span>
    </div>
    
    <v-button v-if="error" @click="fetchImage" type="primary">刷新</v-button>

    <figcaption v-if="props.showDesc && isReady">
      <span>
        <slot></slot>
      </span>
    </figcaption>
  </figure>
</template>

<style lang="less" scoped>
@import '@/assets/base.less';

#dark-image() {
  bg-color: lighten(#dark()[secondary], 5%);
  cite-bg-color: lighten(#dark()[secondary], 1%);
}
#image() {
  border-radius: #border-radius[medium];
  margin: 0.5em 0.2em;
  image-margin: 0.8em 0.1em 0.1em 0;
  refresh-btn-margin: 10px 40px;
  desc-padding: 0.6em 0.4em;
  cite-margin: 0.4em 0.3em;
  cite-padding: 0.2em 0;

  desc-font-size: 1.2em;
  no-image-border-radius: #border-radius()[large];
}

.image {
  display: inline-flex;
  vertical-align: middle;
  flex-wrap: nowrap;
  flex-direction: column;
  text-align: center;

  overflow: hidden;
  // border-radius: #image()[no-image-border-radius];

  margin: #image()[margin];
  width: fit-content;
  height: fit-content;
  border: 1px solid #fff;

  img {
    object-fit: contain;
    max-width: 100%;
    max-height: 100%;
    width: ~"v-bind('width')";
    height: ~"v-bind('height')";
    // width: 100%;
    // height: 100%;
    // margin: #image()[image-margin];
  }
  .error {
    margin: #image()[image-margin];
  }
  > .button {
    margin: #image()[refresh-btn-margin];
  }
  figcaption {
    overflow: hidden;
    background-color: #dark-image()[bg-color];
    border-radius: #image()[border-radius];
    padding: #image()[desc-padding];
    word-break: break-all;
    
    display: flex;
    flex-direction: column;

    span {
      font-size: #image()[desc-font-size];
    }
  }
}
</style>
