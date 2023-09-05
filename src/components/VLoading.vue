<script setup lang="ts">
import { LoadingType } from '../constants/ELoadingType';
import { ref, useAttrs } from 'vue';
import { useMotion } from '@vueuse/motion'

const props = withDefaults(defineProps<{
  type?: keyof typeof LoadingType
  size?: string
}>(), {
  type: 'three-wire-surround',
  size: '50'
})
const attrs = useAttrs()

const size = props.size + 'px'

const loading = ref<HTMLElement>()
useMotion(loading, {
  initial: {
    opacity: 0,
    scale: 1,
  },
  enter: {
    opacity: 1,
    transition: {
      type: 'tween',
      delay: 300,
    }
  },
})

</script>

<template>
  <div class="loading" ref="loading">
    <div class="three-wire-surround" v-if="props.type == 'three-wire-surround'">
      <div></div>
      <div></div>
      <div></div>
    </div>

    <div class="viscous-milk" v-else-if="props.type == 'viscous-milk'">
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>
      <span></span>

      <svg width="0" height="0">
        <filter id="loadingvm">
          <feGaussianBlur stdDeviation="2"></feGaussianBlur>

          <feColorMatrix values="
            1 0 0 0 0
            0 1 0 0 0
            0 0 1 0 0 
            0 0 0 20 -10
          "></feColorMatrix>
        </filter>
      </svg>
    </div>

    <span>载入中</span>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#dark-loading-tws() {
  wire-color: lighten(#color()[blue], 2%);
}
#dark-loading-rw() {

}
#dark-loading-vm() {
  color: darken(#color()[white], 1%);
}
#loading() {
  margin: 1.5em;
}
#loading-tws() {
  wire-top-width: calc(~"v-bind('size')" * 0.18);
  wire-right-width: calc(~"v-bind('size')" * 0.05);
  wire-bottom-width: calc(~"v-bind('size')" * 0.25);
  wire-left-width: 0; // 0

  animation-time: 1s;
  animation-delay: 0.4s;
}
#loading-rw() {

}
#loading-vm() {
  animation-time: 6s;
  animation-delay: 0.2s;
}

.loading {
  width: ~"v-bind('size')";
  height: ~"v-bind('size')";
  overflow: visible;

  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  margin: #loading()[margin];

  > span {
    justify-self: flex-end;
    margin-top: calc(~"v-bind('size')" * 1.6);
  }
  
  .three-wire-surround {
    width: 100%;
    height: 100%;
    
    div {
      width: 100%;
      height: 100%;

      border-radius: #border-radius()[circle];
      border-top: #loading-tws()[wire-top-width] solid #dark-loading-tws()[wire-color];
      border-right: #loading-tws()[wire-right-width] solid #dark-loading-tws()[wire-color];
      border-bottom: #loading-tws()[wire-bottom-width] solid transparent;
      border-left: #loading-tws()[wire-left-width] solid transparent;

      position: absolute;

      &:nth-child(1) {
        transform: rotateX(60deg) rotateY(0deg);
        animation: tws-rotation-1 #loading-tws()[animation-time] linear infinite;
        @keyframes tws-rotation-1 {
          100% {
            transform: rotateX(60deg) rotateY(0deg) rotate(360deg);
          }
        }
      }
      &:nth-child(2) {
        transform: rotateX(60deg) rotateY(60deg);
        animation: tws-rotation-2 #loading-tws()[animation-time] linear infinite;
        animation-delay: 0 - #loading-tws()[animation-delay] * 2;
        @keyframes tws-rotation-2 {
          100% {
            transform: rotateX(60deg) rotateY(60deg) rotate(360deg);
          }
        }
      }
      &:nth-child(3) {
        transform: rotateX(60deg) rotateY(-60deg);
        animation: tws-rotation-3 #loading-tws()[animation-time] linear infinite;
        animation-delay: 0 - #loading-tws()[animation-delay];
        @keyframes tws-rotation-3 {
          100% {
            transform: rotateX(60deg) rotateY(-60deg) rotate(360deg);
          }
        }
      }
    }
  }

  .viscous-milk {
    display: flex;
    justify-content: center;
    align-items: center;

    filter: url("#loadingvm");

    width: 100%;
    height: 100%;

    span {
      --i: 0;
      @distance: calc(~"v-bind('size')" / 2 - ~"v-bind('size')" * 0.3 / 2);

      width: 30%;
      height: 30%;

      background-color: #dark-loading-vm()[color];

      border-radius: #border-radius()[circle];
      
      position: absolute;
      left: 0;
      transform-origin: calc(~"v-bind('size')" / 2);
      transform: rotate(0deg) translateX(@distance);

      &:nth-child(2) {
        --i: 1;
      }
      &:nth-child(3) {
        --i: 2;
      }
      &:nth-child(4) {
        --i: 3;
      }
      &:nth-child(5) {
        --i: 4;
      }
      &:nth-child(6) {
        --i: 5;
      }
      &:nth-child(7) {
        --i: 6;
      }
      &:nth-child(8) {
        --i: 7;
      }

      animation: vm #loading-vm()[animation-time] ease-in-out infinite;
      animation-delay: calc(#loading-vm()[animation-delay] * var(--i));
      @keyframes vm {
        0%,
        10%,
        90%,
        100% {
          width: 30%;
          height: 30%;
          transform: rotate(0deg) translateX(@distance);
        }
        40%,
        70% {
          width: 18%;
          height: 18%;
          transform: rotate(calc(360deg / 8 * var(--i)));
        }
      }
    }
  }
  
}
</style>