import { ref, computed } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  // 不会经常改变的数据
  const loggedIn = ref(false)
  const stoken = ref({
    v1: '',
    v2: ''
  })
  const ltoken = ref({
    v1: '',
    v2: ''
  })
  const gameToken = ref('')
  const hk4eToken = ref('')
  const mihoyoId = ref('')
  const accountId = ref('')
  
  // 临时数据
  const loginTicket = ref('')
  const cookieToken = ref('')
  const authKey = ref({
    a: '',
    b: ''
  })

  return { loggedIn, stoken, ltoken, gameToken, hk4eToken, mihoyoId, accountId, loginTicket, cookieToken, authKey }
}, {
  persist: {
    enabled: true,
    strategies: [
      {storage: localStorage, paths: ['loggedIn', 'stoken', 'ltoken', 'gameToken', 'hk4eToken', 'mihoyoId', 'accountId']},
      {storage: sessionStorage, paths: ['loginTicket', 'cookieToken', 'authKey']},
    ]
  }
})
