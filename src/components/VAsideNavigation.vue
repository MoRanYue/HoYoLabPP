<script lang="ts" setup>
import { RouterLink } from 'vue-router';
import VIcon from './VIcon.vue';
import { useDraggable, useMouseInElement, toValue, toRef } from '@vueuse/core';
import { type Dict } from '@/constants/TDict';
import { type NavigationItem } from '@/constants/INavigationItem'
import { ref, watch, type CSSProperties } from 'vue'

const props = withDefaults(defineProps<{
  siteName: string,
  logo?: string,
  draggable?: boolean,
  navItems: NavigationItem[]
}>(), {
  logo: '',
  draggable: false
})

const navigation = ref<HTMLElement>()
const draggingZone = ref<HTMLElement>()

const { isOutside: isNotInDraggingZone } = useMouseInElement(draggingZone, {
  touch: true
})

const { x, y, style, isDragging } = useDraggable(navigation, {
  initialValue: {x: 50, y: 50},
  onStart(pos, ev): boolean {
    if (!toValue(isNotInDraggingZone)) {
      return true
    }

    return false
  }
})
</script>

<template>
  <div class="side-navigation" ref="navigation" :style="props.draggable ? style : ''">
    <div class="dragging" v-if="props.draggable" ref="draggingZone">
      <v-icon type="drag" size="32" :content="false"></v-icon>
    </div>

    <div class="headers">
      <router-link to="Home"><img :src="props.logo" :title="props.siteName"></router-link>
      <span>{{ props.siteName }}</span>
    </div>

    <div class="navigations">
      <ul>
        <li v-for="item in props.navItems" key="item.route">
          <v-icon :type="item.logo" size="28" theme="outline" v-if="item.logo" :content="false"></v-icon>
          <router-link :to="item.route">{{ item.text }}</router-link>
        </li>
      </ul>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#navigation() {
  width: 15em;
  radius: #border-radius()[large-xx];
  dragging-zone-size: 2.5em;
  dragging-zone-transition-time: 0.2s;
  dragging-zone-radius: #border-radius()[circle];
  dragging-zone-top: 0.3em;
  dragging-zone-right: 0.3em;
  header-padding: 0.5em;
  header-img-interval: 0.3em;
  header-img-size: 8rem;
  header-name-size: 2rem;
  navigation-margin-tb: 0.8em;
  navigation-padding: 0.7em;
  navigation-item-padding: 0.4em;
  navigation-radius: #border-radius()[large];
  navigation-item-radius: #border-radius()[medium];
  navigation-item-interval: 0.3em;
  navigation-item-transition-time: 0.2s;
}
#dark-navigation() {
  bg-color: lighten(#dark()[primary], 6%);
  dragging-zone-bg-color: transparent;
  dragging-zone-hover-bg-color: lighten(#dark()[secondary], 25%);
  dragging-zone-active-bg-color: lighten(#dark()[secondary], 10%);
  navigation-bg-color: lighten(#dark()[secondary], 12%);
  navigation-item-bg-color: transparent;
  navigation-item-hover-bg-color: lighten(#dark()[secondary], 20%);
  navigation-item-active-bg-color: lighten(#dark()[secondary], 30%);
  navigation-item-text-color: #dark-text()[color];
  navigation-item-hover-text-color: #dark-text()[important];
  navigation-item-active-text-color: lighten(#dark-text()[important], 20%);
  navigation-item-current-text-color: darken(#dark-text()[important], 20%);
  site-name-color: darken(#dark-text()[important], 2%);
}

.side-navigation {
  background-color: #dark-navigation()[bg-color];
  height: fit-content;
  width: #navigation()[width];
  position: fixed;
  display: flex;
  flex-direction: column;
  border-radius: #navigation()[radius];
  z-index: 999;

  > .dragging {
    width: #navigation()[dragging-zone-size];
    height: #navigation()[dragging-zone-size];
    position: absolute;
    display: flex;
    justify-content: center;
    align-items: center;
    right: #navigation()[dragging-zone-right];
    top: #navigation()[dragging-zone-top];
    transition-duration: #navigation()[dragging-zone-transition-time];
    background-color: #dark-navigation()[dragging-zone-bg-color];
    border-radius: #navigation()[dragging-zone-radius];

    &:hover {
      background-color: #dark-navigation()[dragging-zone-hover-bg-color];
    }
    &:active {
      background-color: #dark-navigation()[dragging-zone-active-bg-color];
    }
  }

  > .headers {
    padding: #navigation()[header-padding];
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;

    img {
      height: #navigation()[header-img-size];
      user-select: none;
    }
    > span {
      font-family: "LXGW WenKai", sans-serif;
      margin-top: #navigation()[header-img-interval];
      font-size: #navigation()[header-name-size];
      user-select: none;
      font-weight: 900;
      color: #dark-navigation()[site-name-color];
    }
  }
  
  > .navigations {
    background-color: #dark-navigation()[navigation-bg-color];
    padding: #navigation()[navigation-padding];
    border-radius: #navigation()[navigation-radius];
    width: 90%;
    margin: #navigation()[navigation-margin-tb] auto;

    > ul {
      list-style: none;

      > li {
        margin-bottom: #navigation()[navigation-item-interval];
        &:last-child {
          margin-bottom: 0;
        }

        display: flex;
        overflow: hidden;
        padding: #navigation()[navigation-item-padding];
        background-color: #dark-navigation()[navigation-item-bg-color];
        border-radius: #navigation()[navigation-item-radius];
        color: #dark-navigation()[navigation-item-text-color];
        transition-duration: #navigation()[navigation-item-transition-time];
        cursor: pointer;
        flex-wrap: nowrap;
        justify-content: space-between;
        align-items: center;

        .icon {
          position: absolute;
          pointer-events: none;
        }

        a {
          text-align: center;
          width: 100%;
          font-size: 1.1em;
          color: #dark-navigation()[navigation-item-text-color];
          text-decoration: none;
          transition-duration: #navigation()[navigation-item-transition-time];

          &.router-link-active {
            color: #dark-navigation()[navigation-item-current-text-color];
          }
        }

        &:hover {
          color: #dark-navigation()[navigation-item-hover-text-color];
          background-color: #dark-navigation()[navigation-item-hover-bg-color];

          a {
            color: #dark-navigation()[navigation-item-hover-text-color];
          }
        }

        &:active {
          color: #dark-navigation()[navigation-item-active-text-color];
          background-color: #dark-navigation()[navigation-item-active-bg-color];

          a {
            color: #dark-navigation()[navigation-item-active-text-color];
          }
        }
      }
    }
  }
}
</style>