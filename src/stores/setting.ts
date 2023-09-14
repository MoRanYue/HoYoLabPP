import { ref, type Ref } from 'vue'
import { toValue } from '@vueuse/core'
import { defineStore } from 'pinia'
import type { Align } from '@/constants/EAlign'

export const useSettingStore = defineStore('setting', () => {
  // 文章
  const forum = ref(2)
  const notificationPosition: Ref<keyof typeof Align> = ref('topRight')
  
  return { forum, notificationPosition }
}, {
  persist: {
    enabled: true,
    strategies: [
      {storage: localStorage},
    ]
  }
})
