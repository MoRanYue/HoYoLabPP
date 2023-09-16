<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()

const props = withDefaults(defineProps<{
  nickname: string
  avatar?: string
  userId?: number | string
  avatarBorder?: boolean
  tip?: string
}>(), {
  avatar: '',
  avatarBorder: true
})

function toUserInfoPage() {
  router.push(`/user/${props.userId}`)
}

</script>

<template>
  <div class="user-anchor">
    <div class="avatar-container">
      <div :class="`avatar${props.avatarBorder ? ' ' + 'border' : ''}`" @click="toUserInfoPage">
        <img :src="props.avatar" v-if="props.avatar">
      </div>
    </div>

    <div class="name-container" @click="toUserInfoPage" :title="String(props.userId)">
      <span class="nickname">{{ nickname }}</span>
      <span class="tip" v-if="props.tip">{{ props.tip }}</span>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#user-anchor() {
  radius: #border-radius()[large];
  font-size: 0.8rem;
  name-padding: 0.5em;
  name-radius: #border-radius()[medium];
  name-transition-time: 0.3s;
  avatar-size: 2.5rem;
  avatar-padding: 0.2em;
  avatar-circle-size: 1px;
  avatar-container-padding: 0;
  avatar-container-hover-padding: 0.5em;
  avatar-container-transition-time: 0.3s;
}
#dark-user-anchor() {
  avatar-bg-color: transparent;
  avatar-hover-bg-color: lighten(#dark()[secondary], 13%);
  avatar-active-bg-color: lighten(#dark()[secondary], 8%);
  avatar-border-color: lighten(#dark()[sub], 7%);
  name-bg-color: lighten(#dark()[primary], 10%);
  name-hover-bg-color: lighten(#dark()[primary], 17%);
  name-active-bg-color: lighten(#dark()[primary], 7%);
}

.user-anchor {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;

  .name-container {
    cursor: pointer;
    padding: #user-anchor()[name-padding];
    background-color: #dark-user-anchor()[name-bg-color];
    border-radius: #user-anchor()[name-radius];
    transition-duration: #user-anchor()[name-transition-time];

    // &::before {
    //   content: "";
    //   width: 2em;
    //   height: 2em;
    //   position: absolute;
    //   background-color: #dark-user-anchor()[name-bg-color];
    // }
    &:hover {
      background-color: #dark-user-anchor()[name-hover-bg-color];
    }
    &:active {
      background-color: #dark-user-anchor()[name-active-bg-color];
    }

    > span {
      font-size: #user-anchor()[font-size];
    }
  }

  .avatar-container {
    padding: #user-anchor()[avatar-container-padding];
    border-radius: #border-radius()[circle];
    // background-color: #dark-user-anchor()[avatar-bg-color];
    transition-duration: #user-anchor()[avatar-container-transition-time];

    &:hover {
      padding: #user-anchor()[avatar-container-hover-padding];
      background-color: #dark-user-anchor()[avatar-hover-bg-color];
    }
    
    &:active {
      background-color: #dark-user-anchor()[avatar-active-bg-color];
    }

    .avatar {
      height: #user-anchor()[avatar-size];
      width: #user-anchor()[avatar-size];
      border-radius: #border-radius()[circle];
      overflow: hidden;
      cursor: pointer;

      &[class~="border"]::before {
        content: "";
        height: #user-anchor()[avatar-size] + #user-anchor()[avatar-padding];
        width: #user-anchor()[avatar-size] + #user-anchor()[avatar-padding];
        position: absolute;
        // background-color: aliceblue;
        transform: translate(0 - 2 * #user-anchor()[avatar-circle-size] - 4 * #user-anchor()[avatar-padding], 0 - 2 * #user-anchor()[avatar-circle-size] - 4 * #user-anchor()[avatar-padding]);
        border-radius: #border-radius()[circle];
        border: #user-anchor()[avatar-circle-size] solid #dark-user-anchor()[avatar-border-color];
      }

      img {
        user-select: none;
        display: block;
        height: 100%;
        width: 100%;
      }
    }
  }
}

</style>