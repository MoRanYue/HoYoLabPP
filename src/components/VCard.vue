<script setup lang="ts">
import { ref, type Ref, useAttrs, unref, computed, type CSSProperties, type ComputedRef } from 'vue';
import VIcon from './VIcon.vue';
import { useParallax } from '@vueuse/core';

const props = withDefaults(defineProps<{
  icon?: string
  title?: string
  perspective?: boolean
  shadow?: boolean
}>(), {
  icon: '',
  title: '',
  perspective: false,
  shadow: false,
})

const target = ref<HTMLElement>()
let tilt: Ref<number> = ref(0)
let roll: Ref<number> = ref(0)
if (props.perspective) {
  const parallax = useParallax(target)
  tilt = parallax.tilt
  roll = parallax.roll
}

</script>

<template>
  <section class="card" ref="target">
    <div :class="`content${props.shadow ? ' shadow' : ''}`">
      <div class="title">
        <v-icon v-if="props.icon" :type="props.icon" size="28" theme="outline" strokeLinejoin="bevel"></v-icon>
        <span class="title-text">{{ props.title }}</span>
      </div>

      <div class="inner-content">
        <slot></slot>
      </div>
    </div>
  </section>
</template>

<style lang="less" scoped>
@import '@/assets/base.less';

#card() {
  perspective: 8em;
  border-radius: #border-radius()[medium];
  title-border-radius: #border-radius()[small];
  title-padding: 0.5em 1em;
  title-size: 1.5rem;
  title-icon-interval: 1em;
  perspective-text-distance: 15px;
  perspective-bg-angle: 8deg;
  inner-content-font-size: 1.2rem;
  inner-content-padding: 0.8em 1.1em;
}
#dark-card() {
  bg-color: lighten(#dark()[primary], 6%);
  title-color: darken(#dark()[content], 14%);
  title-bg-color: darken(#dark()[secondary], 8%);
}

.card {
  perspective: #card()[perspective];
  min-width: fit-content;
  min-height: fit-content;
  z-index: 0;

  &:hover {
    z-index: 3;
  }

  .content {
    width: 100%;
    height: 100%;

    display: flex;
    flex-direction: column;
    flex-wrap: nowrap;

    border-radius: #card()[border-radius];
    background-color: #dark-card()[bg-color];
    transform: rotateY(calc(~"v-bind('tilt')" * #card()[perspective-bg-angle])) rotateX(calc(~"v-bind('roll')" * #card()[perspective-bg-angle]));

    .title {
      flex-shrink: 0;
      padding: #card()[title-padding];
      color: #dark-card()[title-color];
      border-radius: #card()[title-border-radius];
      background: #dark-card()[title-bg-color];
      
      display: flex;
      align-items: center;

      span {
        margin-right: #card()[title-icon-interval];
      }
      .title-text {
        font-size: #card()[title-size];
      }
    }

    .inner-content {
      font-size: #card()[inner-content-font-size];
      padding: #card()[inner-content-padding];
      flex-shrink: 0;
      transform: translateY(calc(~"v-bind('roll')" * #card()[perspective-text-distance])) translateX(calc(~"v-bind('tilt')" * #card()[perspective-text-distance]));
    }
  }
}
</style>
