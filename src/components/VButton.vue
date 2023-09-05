<script setup lang="ts">
import { useAttrs } from 'vue';
import type { ButtonType } from '@/constants/EButtonType';
import VIcon from './VIcon.vue';

const props = withDefaults(defineProps<{
  type?: keyof typeof ButtonType
  icon?: string
  iconTheme?: 'outline' | 'filled' | 'two-tone' | 'multi-color'
  iconWidth?: number
}>(), {
  type: 'primary',
  iconTheme: 'outline',
  icon: '',
  iconWidth: 1
})

const attrs = useAttrs()
const width: string = <string>attrs.width + 'px' ?? 'fit-content'
const height: string = <string>attrs.height + 'px' ?? 'fit-content'
</script>

<template>
  <button type="button" :class="`button ${props.type}`">
    <span></span>
    <span></span>
    <span></span>
    <span></span>

    <v-icon :type="props.icon" :theme="props.iconTheme" v-if="props.icon" :stroke-width="props.iconWidth" size="24"></v-icon>
    <slot></slot>
  </button>
</template>

<style lang="less" scoped>
@import '@/assets/base.less';

#button-primary-decoration() {
  width: 10px;
  transition-time: 0.5s;
  border-style: solid;
  border-width: 2px;
  gap: 2px;
}
#button-primary() {
  padding: 0.4em 0.6em;
  border-style: solid;
  border-width: 2px;
  text-spacing: 0.1em;
  font-size: 1.1em;
  transition-time: 0.25s;
  icon-interval: 0.3em;
}
#button-icon() {
  padding: 0.2em;
  transition-time: 0.2s;
  radius: #border-radius()[large];
}
#button-secondary() {
  padding: 0.6em;
  transition-time: 0.2s;
  radius: #border-radius()[medium];
}
#dark-button-icon() {
  color: #dark()[content];
  bg-color: lighten(#dark()[secondary], 15%);
  hover-bg-color: lighten(#dark()[secondary], 12%);
  active-bg-color: lighten(#dark()[secondary], 8%);
}
#dark-button-secondary() {
  color: darken(#dark()[content], 3%);
  bg-color: lighten(#dark()[secondary], 20%);
  hover-bg-color: lighten(#dark()[secondary], 22%);
  active-bg-color: lighten(#dark()[secondary], 16%);
}
#dark-button-primary() {
  bg-color: darken(#dark()[secondary], 6%);
  hover-bg-color: darken(#dark()[secondary], 1%);
  active-bg-color: lighten(#dark()[secondary], 6%);
  color: #dark()[content];
  border-color: darken(#dark()[sub], 3%);
}
#dark-button-primary-decoration() {
  border-color: lighten(#dark()[sub], 4%);
  bg-color: lighten(#dark-button-primary()[bg-color], 1%);
}

.button {
  user-select: none;
  cursor: pointer;

  &.secondary {
    width: fit-content;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: center;
    border-radius: #button-secondary[radius];
    padding: #button-secondary()[padding];
    color: #dark-button-secondary()[color];
    background-color: #dark-button-secondary()[bg-color];
    transition-duration: #button-secondary()[transition-time];
    outline: none;
    border: 0;

    &:hover {
      background-color: #dark-button-secondary[hover-bg-color];
    }

    &:active {
      background-color: #dark-button-secondary[active-bg-color];
    }
  }

  &.icon {
    border-radius: #button-icon[radius];
    padding: #button-icon()[padding];
    color: #dark-button-icon()[color];
    background-color: #dark-button-icon()[bg-color];
    transition-duration: #button-icon()[transition-time];
    outline: none;
    border: 0;

    &:hover {
      background-color: #dark-button-icon[hover-bg-color];
    }

    &:active {
      background-color: #dark-button-icon[active-bg-color];
    }
  }

  &.primary {
    width: ~"v-bind('width')";
    height: ~"v-bind('height')";
    min-height: fit-content;
    min-width: fit-content;
    background-color: #dark-button-primary()[bg-color];
    color: #dark-button-primary()[color];

    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: row;

    letter-spacing: #button-primary()[text-spacing];
    font-size: #button-primary()[font-size];
    outline: none;
    padding: #button-primary()[padding];
    border: #button-primary()[border-width] #button-primary()[border-style] #dark-button-primary()[border-color];
    transition-duration: #button-primary()[transition-time];

    .icon {
      margin-right: #button-primary()[icon-interval];
    }

    span:not([class~="icon"]) {
      position: absolute;
      width: #button-primary-decoration()[width];
      height: #button-primary-decoration()[width];
      transition: #button-primary-decoration()[transition-time];
      pointer-events: none;

      &:nth-child(1) {
        top: 0 - #button-primary-decoration()[gap];
        left: 0 - #button-primary-decoration()[gap];
        background-color: #dark-button-primary-decoration()[bg-color];
        border-bottom: #button-primary-decoration()[border-width] #button-primary-decoration()[border-style] #dark-button-primary-decoration()[border-color];
        border-right: #button-primary-decoration()[border-width] #button-primary-decoration()[border-style] #dark-button-primary-decoration()[border-color];
      }

      &:nth-child(2) {
        top: 0 - #button-primary-decoration()[gap];
        right: 0 - #button-primary-decoration()[gap];
        background-color: #dark-button-primary-decoration()[bg-color];
        transform: rotate(90deg);
        border-bottom: #button-primary-decoration()[border-width] #button-primary-decoration()[border-style] #dark-button-primary-decoration()[border-color];
        border-right: #button-primary-decoration()[border-width] #button-primary-decoration()[border-style] #dark-button-primary-decoration()[border-color];
      }

      &:nth-child(3) {
        bottom: 0 - #button-primary-decoration()[gap];
        right: 0 - #button-primary-decoration()[gap];
        background-color: #dark-button-primary-decoration()[bg-color];
        transform: rotate(180deg);
        border-bottom: #button-primary-decoration()[border-width] #button-primary-decoration()[border-style] #dark-button-primary-decoration()[border-color];
        border-right: #button-primary-decoration()[border-width] #button-primary-decoration()[border-style] #dark-button-primary-decoration()[border-color];
      }

      &:nth-child(4) {
        bottom: 0 - #button-primary-decoration()[gap];
        left: 0 - #button-primary-decoration()[gap];
        background-color: #dark-button-primary-decoration()[bg-color];
        transform: rotate(270deg);
        border-bottom: #button-primary-decoration()[border-width] #button-primary-decoration()[border-style] #dark-button-primary-decoration()[border-color];
        border-right: #button-primary-decoration()[border-width] #button-primary-decoration()[border-style] #dark-button-primary-decoration()[border-color];
      }
    }

    &:active {
      background-color: #dark-button-primary()[active-bg-color];
    }

    &:hover {
      background-color: #dark-button-primary()[hover-bg-color];

      @enlarge-size: 0 - #button-primary-decoration()[width] - #button-primary-decoration()[gap];
      @spread-size: #button-primary-decoration()[gap];

      span {
        &:nth-child(1) {
          top: @spread-size;
          left: @spread-size;
          width: 100%;
          height: 100%;
          background-color: transparent;
          transition-delay: 0s;
        }

        &:nth-child(2) {
          top: @enlarge-size;
          right: @enlarge-size;
          background-color: transparent;
          transition-duration: 0.25s;
        }

        &:nth-child(3) {
          bottom: @spread-size;
          right: @spread-size;
          width: 100%;
          height: 100%;
          background-color: transparent;
          transition-duration: 0.5s;
        }

        &:nth-child(4) {
          bottom: @enlarge-size;
          left: @enlarge-size;
          background-color: transparent;
          transition-duration: 0.75s;
        }
      }
    }
  }
}

</style>
