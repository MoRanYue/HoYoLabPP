<script setup lang="ts">
import { notifications, removeNotification } from '@/utils/notification'
import { computed, type CSSProperties } from 'vue';
import VButton from './VButton.vue';
import VIcon from './VIcon.vue';
import type { Align } from '@/constants/EAlign';
import type { NotificationType } from '@/constants/ENotificationType';

// const props = withDefaults(defineProps<{}>(), {})
const emits = defineEmits(['close'])

function getIcon(type: keyof typeof NotificationType) {
  switch (type) {
    case 'error':
      return 'error'

    case 'warning':
      return 'caution'

    case 'success':
      return 'check'

    case 'failure':
      return 'abnormal'
  
    default:
      return 'info'
  }
}

const notificationOffset = '1.2em'
const position: Record<keyof typeof Align, CSSProperties> = {
  top: {
    left: '50%',
    top: notificationOffset,
    transform: 'translateX(-50%)'
  },
  bottom: {
    left: '50%',
    bottom: notificationOffset,
    transform: 'translateX(-50%)'
  },
  left: {
    top: '50%',
    left: notificationOffset,
    transform: 'translateY(-50%)'
  },
  right: {
    top: '50%',
    right: notificationOffset,
    transform: 'translateY(-50%)'
  },
  topLeft: {
    top: notificationOffset,
    left: notificationOffset
  },
  topRight: {
    top: notificationOffset,
    right: notificationOffset
  },
  bottomLeft: {
    left: notificationOffset,
    bottom: notificationOffset
  },
  bottomRight: {
    bottom: notificationOffset,
    right: notificationOffset
  },
}

function removeNotify(id: string) {
  removeNotification(id)
  emits('close', id)
}
</script>

<template>
  <section class="notification" :style="position[notifications.direction]">
    <ul>
      <li v-for="notification in notifications.notifications" :key="notification.id"
      v-motion 
      :initial="{
        opacity: 0,
        x: 100
      }" 
      :enter="{
        opacity: 1,
        x: 0
      }"
      >
        <div class="icon">
          <v-icon :type="getIcon(notification.type)" theme="outline" :stroke-width="1" size="40"></v-icon>
        </div>

        <div class="text-content">
          <span v-if="notification.title" class="title">{{ notification.title }}</span>
          <span class="content">{{ notification.content }}</span>
        </div>

        <div class="operation">
          <v-button type="icon" icon="close" @click="removeNotify(notification.id)"></v-button>
        </div>
      </li>
    </ul>
  </section>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#notification() {
  padding: 0.5em;
  radius: #border-radius()[large];
  shadow: 7px 4px 3px 3px #dark-notification()[shadow-color];
  notification-item-interval: 0.4em;
  notification-item-min-width: 17em;
  title-interval: 0.5em;
  title-font-size: 1.13rem;
  icon-interval: 0.5em;
  operation-interval: 0.4em;
}
#dark-notification() {
  bg-color: lighten(#dark()[secondary], 8%);
  shadow-color: darken(#dark()[secondary], 2%);
}

.notification {
  > ul {
    list-style: none;

    > li {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
      background-color: #dark-notification()[bg-color];
      padding: #notification()[padding];
      border-radius: #notification()[radius];
      margin-bottom: #notification()[notification-item-interval];
      min-width: #notification()[notification-item-min-width];
      box-shadow: #notification()[shadow];

      > .icon {
        margin-right: #notification()[icon-interval];
      }

      > .text-content {
        display: flex;
        flex-direction: column;
        flex-wrap: nowrap;
        flex-grow: 1;
        user-select: none;

        .title {
          margin-bottom: #notification()[title-interval];
          font-size: #notification()[title-font-size];
          font-weight: 900;
        }

        .content {

        }
      }

      > .operation {
        margin-left: #notification()[operation-interval];
      }
    }
  }
}

</style>