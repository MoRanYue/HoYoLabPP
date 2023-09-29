<script setup lang="ts">
import type { NumberId } from '@/constants/Api';
import { randomMinZero, randomRange } from '@/utils/utils';

const props = withDefaults(defineProps<{
  icon: string
  image: string
  name: string
  id: NumberId
  background?: string
}>(), {
  background: ''
})

const bgAnimationDelay = `${randomRange(-10, 10)}s`
</script>

<template>
  <div class="game-record-character-slot">
    <div class="avatar">
      <img class="avatar" :src="props.icon" :title="props.name" :alt="props.name">
      <img class="background" :src="props.background" alt="" v-if="props.background">
    </div>

    <div class="text">
      <span>{{ props.name }}</span>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#game-record-character-slot() {
  radius: #border-radius()[large];
  inset-shadow: inset 0 0 10px #dark-game-record-character-slot()[inset-shadow-color];
  name-shadow: 0 2px 4px #dark-game-record-character-slot()[name-shadow-color];
  text-padding: 0.3em 0.5em;
  avatar-height: 8em;
  background-opacity: 0.3;
}
#dark-game-record-character-slot() {
  text-bg-color: fadeout(#color()[black], 40%);
  inset-shadow-color: fadeout(#color()[black], 20%);
  name-shadow-color: fadeout(#color()[black], 70%);
}

@keyframes rotation {
  from {
    transform: rotate(180deg);
  }
  to {
    transform: rotate(540deg);
  }
}

.game-record-character-slot {
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;
  align-items: center;
  border-radius: #game-record-character-slot()[radius];
  overflow: hidden;
  position: relative;

  &::after {
    @offset: -300px;

    content: "";
    position: absolute;
    top: @offset;
    right: @offset;
    bottom: @offset;
    left: @offset;
    z-index: 0;
    background: conic-gradient(from 185deg at 50% 50%, 
    #000 -95deg, #07075e 15deg, #987588 55deg, 115deg, #98aeea 185deg, #667766 220deg, #121212 375deg);
    filter: blur(5em) brightness(1.3);
    z-index: 0;
    animation: rotation 35s linear infinite;
    // animation-delay: v-bind('bgAnimationDelay');
  }

  > * {
    z-index: 1;
  }

  .avatar {
    flex-grow: 1;
    height: #game-record-character-slot()[avatar-height];
    box-shadow: #game-record-character-slot()[inset-shadow];
    position: relative;

    .avatar {
      width: 100%;
      height: 100%;
      display: block;
    }

    .background {
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      right: 0;
      width: 100%;
      height: 100%;
      transform: scale(1.05, 1.05);
      opacity: #game-record-character-slot()[background-opacity];
      z-index: -1;
    }
  }

  .text {
    background-color: #dark-game-record-character-slot()[text-bg-color];
    width: 100%;
    height: 100%;
    padding: #game-record-character-slot()[text-padding];
    text-align: center;
    user-select: none;

    span {
      text-shadow: #game-record-character-slot()[name-shadow];
      font-weight: 550;
    }
  }
}



</style>