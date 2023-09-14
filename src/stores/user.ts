import { ref } from 'vue'
import { toValue } from '@vueuse/core'
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
  const deviceFingerprint = ref('')
  const loginTicket = ref('')
  const cookieToken = ref('')
  const authKey = ref({
    a: '',
    b: ''
  })

  function logout() {
    stoken.value = {
      v1: '',
      v2: ''
    }
    ltoken.value = {
      v1: '',
      v2: ''
    }
    gameToken.value = ''
    hk4eToken.value = ''
    mihoyoId.value = ''
    accountId.value = ''
    deviceFingerprint.value = ''
    loginTicket.value = ''
    cookieToken.value = ''
    authKey.value = {
      a: '',
      b: ''
    }
    loggedIn.value = false
  }

  function stokenCookie(version: 1 | 2 = 2) {
    if (version == 2) {
      return {
        stoken: toValue(stoken).v2,
        stmid: toValue(mihoyoId)
      }
    }
    else if (version == 1) {
      return {
        stoken: toValue(stoken).v1,
        stuid: toValue(accountId)
      }
    }
  }

  function ltokenCookie(version: 1 | 2 = 2) {
    if (version == 2) {
      return {
        ltoken_v2: toValue(ltoken).v2,
        ltmid_v2: toValue(mihoyoId)
      }
    }
    else if (version == 1) {
      return {
        ltoken: toValue(ltoken).v1,
        ltuid: toValue(accountId)
      }
    }
  }

  function chooseLtoken() {
    return toValue(ltoken).v2 || toValue(ltoken).v1
  }

  function chooseStoken() {
    return toValue(stoken).v2 || toValue(stoken).v1
  }

  return { loggedIn, stoken, cookieToken, deviceFingerprint, ltoken, gameToken, hk4eToken, mihoyoId, accountId, loginTicket, authKey, 
    stokenCookie, ltokenCookie, chooseLtoken, chooseStoken, logout }
}, {
  persist: {
    enabled: true,
    strategies: [
      {storage: localStorage, paths: ['loggedIn', 'stoken', 'ltoken', 'gameToken', 'hk4eToken', 'mihoyoId', 'accountId']},
      {storage: sessionStorage, paths: ['loginTicket', 'cookieToken', 'authKey', 'deviceFingerprint']},
    ]
  }
})
