import { reactive } from 'vue'
import type { NotificationType } from '@/constants/ENotificationType'
import type { Align } from '@/constants/EAlign'
import { randomUuid4 } from './utils'

export const notifications: {
  direction: keyof typeof Align
  deadTime: number
  notifications: {
    title?: string
    content: string
    type: keyof typeof NotificationType
    id: string
  }[]
} = reactive({
  direction: 'topRight',
  deadTime: 5,
  notifications: []
})

export function notify(content: string, title?: string, type: keyof typeof NotificationType = 'info') {
  const id = randomUuid4()
  notifications.notifications.push({
    content,
    title,
    type,
    id
  })
  console.log('create notify', id, content)

  setTimeout(() => {
    removeNotification(id)
  }, notifications.deadTime * 1000);
}

export function removeNotification(id: string) {
  notifications.notifications.forEach((notification, i) => {
    if (notification.id == id) {
      notifications.notifications.splice(i, 1)
      console.log('close notify', id)
      return
    }
  });
}