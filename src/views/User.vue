<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useRoute, useRouter } from 'vue-router';
import { ref, watch, type Ref, onMounted, computed } from 'vue';
import { toValue, useElementVisibility } from '@vueuse/core';
import { AwesomeQR } from 'awesome-qr'
import { notify } from '@/utils/notification'
import { 
  getStokenAndLtokenByLoginTicket, 
  loginMihoyoByPassword, 
  loginMihoyoByPasswordCreateMmt, 
  userInfo, 
  getStokenV2ByStokenV1, 
  getHoyolabCookieTokenByStoken, 
  getFingerprint, 
  loginHoyolabByPassword, 
  generateHoyolabQrcode,
  checkHoyolabQrcodeStatus,
  unfollowUser,
  followUser,
  generateGenshinImpactQrcode,
  checkGenshinImpactQrcodeStatus,
  getHoyolabCookieTokenByGameToken,
  getLtokenV1ByStoken,
  getStokenV2ByGameToken
} from '@/api/interfaces';
import VTextInput from '@/components/VTextInput.vue';
import VIcon from '@/components/VIcon.vue';
import VButton from '@/components/VButton.vue';
import VTab from '@/components/VTab.vue';
import VTabItem from '@/components/VTabItem.vue';
import VDataShow from '@/components/VDataShow.vue';
import { HoyolabApiReturnCode, hoyolabParentForum, type NumberId } from '@/constants/Api';
import { cookieToDict, formatTime, randomChar } from '@/utils/utils';
import type { Dict } from '@/constants/TDict';

const route = useRoute()
const router = useRouter()
const user = useUserStore()

const needLogin = ref(!user.loggedIn)
watch(needLogin, needLogin => {
  if (!needLogin && !toValue(userData).userId) {
    viewUser()
  }
})

const loginMethods = [
  {text: '米哈游通行证密码登录（Login Ticket）', value: 'mihoyoPassword'},
  {text: '米游社密码登录（Login Ticket）', value: 'hoyolabPassword'},
  {text: '米游社验证码登录（Login Ticket）', value: 'hoyolabSms'},
  {text: '米游社扫码登录（LToken）', value: 'hoyolabQrcode'},
  {text: '原神扫码登录（Game Token）', value: 'genshinQrcode'},
]

const verificationCode = ref<{
  isVerifing: boolean
  src: string
}>({
  isVerifing: false,
  src: ''
})

const hoyolabQrcode = ref<HTMLImageElement>()
const genshinQrcode = ref<HTMLImageElement>()

const isTimeToGenerateHoyolabQrcode = useElementVisibility(hoyolabQrcode)
watch(isTimeToGenerateHoyolabQrcode, (needGenerate) => {
  if (needGenerate) {
    loginByQrcodeThroughHoyolab()
  }
})
const isTimeToGenerateGenshinQrcode = useElementVisibility(genshinQrcode)
watch(isTimeToGenerateGenshinQrcode, (needGenerate) => {
  if (needGenerate) {
    loginByQrcodeThroughGenshinImpact()
  }
})

// verificationCode.value.isVerifing = true
const isDestroyingRequest = ref(false)

const accountName = ref('')
const password = ref('')
async function loginByPasswordThroughMihoyo() {
  const mmtInfo = await loginMihoyoByPasswordCreateMmt(toValue(accountName))

  if (mmtInfo.data.status != 1) {
    notify(`${mmtInfo.data.status}：${mmtInfo.data.msg}`, '登录失败', 'error')
    return
  }
  if (mmtInfo.data.mmt_type == 1) {
    
  }

  const mmtKey = mmtInfo.data.mmt_data.mmt_key
  const gt = mmtInfo.data.mmt_data.gt

  const accountInfo = await loginMihoyoByPassword(mmtKey, toValue(accountName), toValue(password))
  
  if (accountInfo.code != 200) {
    notify(`${accountInfo.code}：${accountInfo.message}`, '登录失败', 'error')
    return
  }
  if (accountInfo.data.status != 1) {
    notify(`${accountInfo.data.status}：${accountInfo.data.msg}`, '登录失败', 'error')
    return
  }

  const info = accountInfo.data.account_info
  await storeTokensWithLoginTicket(info.weblogin_token, info.account_id)
}

async function loginByPasswordThroughHoyolab() {
  const accountInfo = await loginHoyolabByPassword(toValue(accountName), toValue(password))
}

const qrcodeCreativeTime = ref<number>()
const qrcodeScannedTime = ref<number>()
async function loginByQrcodeThroughHoyolab() {
  const deviceId = randomChar(8)

  const qrcodeInfo = await generateHoyolabQrcode(deviceId)
  if (qrcodeInfo.retcode != HoyolabApiReturnCode.success) {
    notify(`${qrcodeInfo.retcode}：${qrcodeInfo.message}`, '创建二维码失败', 'error')
    return
  }

  const ticket: string = qrcodeInfo.data.ticket
  const qrcode = new AwesomeQR({
    text: qrcodeInfo.data.url
  })
  qrcodeCreativeTime.value = Date.now()

  qrcode.draw().then(dataUrl => {
    if (!hoyolabQrcode.value) {
      return 
    }

    hoyolabQrcode.value.src = <string>dataUrl
  })

  const timer = setInterval(async () => {
    const qrcodeStatus = await checkHoyolabQrcodeStatus(deviceId, user.deviceFingerprint, ticket)

    if (toValue(isDestroyingRequest)) {
      notify('登录已取消', '登录失败', 'failure')
      clearInterval(timer)
      return
    }

    if (qrcodeStatus.retcode != HoyolabApiReturnCode.success) {
      qrcodeCreativeTime.value = undefined
      qrcodeScannedTime.value = undefined
      hoyolabQrcode.value!.src = ''

      clearInterval(timer)
      return await loginByQrcodeThroughHoyolab()
    }

    const status = qrcodeStatus.data.status
    if (status == 'Created') {
      // notify('已创建', '二维码状态')
    }
    else if (status == 'Scanned') {
      if (!toValue(qrcodeScannedTime)) {
        qrcodeScannedTime.value = Date.now()
      }
      // notify('已扫描', '二维码状态')
    }
    else if (status == 'Confirmed') {
      notify('已确认登录', '二维码状态')
      clearInterval(timer)

      qrcodeCreativeTime.value = undefined
      qrcodeScannedTime.value = undefined

      let tokens: Dict = {}
      qrcodeStatus.cookies.forEach(cookie => {
        tokens = {...tokens, ...cookieToDict(cookie)}
      });

      user.loggedIn = true
      user.accountId = tokens.account_id_v2
      user.mihoyoId = tokens.account_mid_v2
      user.cookieToken = tokens.cookie_token_v2
      user.ltoken.v2 = tokens.ltoken_v2

      notify('登录成功', '二维码状态', 'success')

      needLogin.value = false

      return
    }

  }, 1500)
}
async function loginByQrcodeThroughGenshinImpact() {
  const deviceId = randomChar(8)

  const qrcodeInfo = await generateGenshinImpactQrcode(deviceId)
  if (qrcodeInfo.retcode != HoyolabApiReturnCode.success) {
    return notify(`${qrcodeInfo.retcode}：${qrcodeInfo.message}`, '创建二维码失败', 'error')
  }

  const ticket: string = <string>(new URL(qrcodeInfo.data.url).searchParams.get('ticket'))

  const qrcode = new AwesomeQR({
    text: qrcodeInfo.data.url,
  })
  qrcodeCreativeTime.value = Date.now()
  qrcode.draw().then(dataUrl => {
    if (!genshinQrcode.value) {
      return 
    }

    genshinQrcode.value.src = <string>dataUrl
  })

  const timer = setInterval(async () => {
    const qrcodeStatus = await checkGenshinImpactQrcodeStatus(deviceId, ticket)

    if (toValue(isDestroyingRequest)) {
      notify('登录已取消', '登录失败', 'failure')
      clearInterval(timer)
      return
    }

    if (qrcodeStatus.retcode != HoyolabApiReturnCode.success) {
      qrcodeCreativeTime.value = undefined
      qrcodeScannedTime.value = undefined
      hoyolabQrcode.value!.src = ''

      clearInterval(timer)
      return await loginByQrcodeThroughGenshinImpact()
    }

    const status = qrcodeStatus.data.stat
    if (status == 'Init') {
      // notify('已创建', '二维码状态')
    }
    else if (status == 'Scanned') {
      if (!toValue(qrcodeScannedTime)) {
        qrcodeScannedTime.value = Date.now()
      }
      // notify('已扫描', '二维码状态')
    }
    else if (status == 'Confirmed') {
      notify('已确认登录', '二维码状态')
      clearInterval(timer)

      qrcodeCreativeTime.value = undefined
      qrcodeScannedTime.value = undefined

      const userIdAndGameToken = JSON.parse(qrcodeStatus.data.payload.raw)
      user.accountId = userIdAndGameToken.uid
      user.gameToken = userIdAndGameToken.token

      const stokenV2 = await getStokenV2ByGameToken(user.gameToken, user.accountId)
      user.stoken.v2 = stokenV2.data.token.token
      user.mihoyoId = stokenV2.data.user_info.mid

      const cookieToken = await getHoyolabCookieTokenByGameToken(user.gameToken, user.accountId)
      user.cookieToken = cookieToken.data.cookie_token

      // const stokenV2 = await getStokenV2ByStokenV1(user.stoken.v1, user.accountId)
      // user.stoken.v2 = stokenV2.data.token.token

      const ltokenV1 = await getLtokenV1ByStoken(user.chooseStoken(), user.accountId, user.mihoyoId)
      user.ltoken.v1 = ltokenV1.data.ltoken

      user.loggedIn = true

      notify('登录成功', '二维码状态', 'success')

      needLogin.value = false

      return
    }

  }, 1500)
}

async function storeTokensWithLoginTicket(loginTicket: string, accountId: NumberId) {
  user.loggedIn = true
  user.loginTicket = loginTicket
  user.accountId = String(accountId)

  const stokenAndLtoken = await getStokenAndLtokenByLoginTicket(user.loginTicket, user.accountId)
  stokenAndLtoken.data.list.forEach(token => {
    if (token.name == 'stoken') {
      user.stoken.v1 = token.token
    }
    else if (token.name == 'ltoken') {
      user.ltoken.v1 = token.token
    }
  });

  const stokenV2 = await getStokenV2ByStokenV1(user.stoken.v1, user.accountId)
  user.stoken.v2 = stokenV2.data.token.token
  user.mihoyoId = stokenV2.data.user_info.mid

  const hoyolabCookieToken = await getHoyolabCookieTokenByStoken(user.stoken.v1, user.mihoyoId, user.accountId)
  user.cookieToken = hoyolabCookieToken.data.cookie_token

  needLogin.value = false
}

function setDeviceFp() {
  if (!user.deviceFingerprint) {
    getFingerprint().then(fp => {
      user.deviceFingerprint = <string>(fp.data.device_fp)
    })
  }
}
setDeviceFp()

function destroyLoginProcess() {
  isDestroyingRequest.value = true
  qrcodeCreativeTime.value = undefined
  qrcodeScannedTime.value = undefined

  setTimeout(() => {
    if (toValue(isDestroyingRequest)) {
      isDestroyingRequest.value = false
    }
  }, 1700)
}
router.afterEach(() => destroyLoginProcess())

const userData = ref<{
  ready: boolean
  nickname: string
  userId: NumberId
  avatar: string
  introduce: string
  status: {
    followedMe: boolean
    following: boolean
  }
  forumLevel: {
    gameId: NumberId
    level: number
    exp: number
  }[]
  data: {
    like: number
    post: number
    replyPost: number
    following: number
    fans: number
    topic: number
    essencePost: number
  }
}>()

const followRelation = computed((): 'nothing' | 'followedIt' | 'followedMe' | 'followEachOther' => {
  const data = toValue(userData).status

  if (data.following) {
    if (data.followedMe) {
      return 'followEachOther'
    }
    else {
      return 'followedIt'
    }
  }
  else if (data.followedMe) {
    return 'followedMe'
  }
  else {
    return 'nothing'
  }
})
// let followRelation: Ref<'nothing' | 'followedIt' | 'followedMe' | 'followEachOther'> = ref('nothing')
// function setFollowRelation() {
//   const data = toValue(userData).status

//   if (data.following) {
//     if (data.followedMe) {
//       followRelation.value = 'followEachOther'
//     }
//     else {
//       followRelation.value = 'followedIt'
//     }
//   }
//   else if (data.followedMe) {
//     followRelation.value = 'followedMe'
//   }
//   else {
//     followRelation.value = 'nothing'
//   }

//   console.log(followRelation.value)
// }

async function viewUser() {
  const specialUserId = route.params.userId
  let userDataRes: Dict
  if (specialUserId) {
    userDataRes = await userInfo(specialUserId, 'web', user.chooseLtoken(), user.accountId, user.mihoyoId)
  }
  else if (!user.loggedIn) {
    return
  }
  else {
    userDataRes = await userInfo(user.accountId, 'web', user.chooseLtoken(), user.accountId, user.mihoyoId)
  }

  if (userDataRes.retcode != HoyolabApiReturnCode.success) {
    return
  }

  const info = userDataRes.data.user_info
  userData.value = {
    ready: false,
    avatar: '',
    nickname: '',
    forumLevel: [],
    introduce: '',
    data: {
      like: 0,
      essencePost: 0,
      fans: 0,
      following: 0,
      post: 0,
      replyPost: 0,
      topic: 0
    },
    status: {
      followedMe: false,
      following: false
    },
    userId: 0,
  }
  userData.value.nickname = info.nickname
  userData.value.avatar = info.avatar_url
  userData.value.userId = info.uid
  userData.value.introduce = info.introduce
  info.level_exps.forEach(level => {
    userData.value.forumLevel.push({
      gameId: level.game_id,
      level: level.level,
      exp: level.exp
    })
  });

  if (userDataRes.data.follow_relation) {
    userData.value.status.followedMe = userDataRes.data.follow_relation.is_followed
    userData.value.status.following = userDataRes.data.follow_relation.is_following
  }

  const userStats = info.achieve
  userData.value.data.like = userStats.like_num
  userData.value.data.post = userStats.post_num
  userData.value.data.following = userStats.follow_cnt
  userData.value.data.fans = userStats.followed_cnt
  userData.value.data.topic = userStats.topic_cnt
  userData.value.data.essencePost = userStats.good_post_num
  userData.value.data.replyPost = userStats.replypost_num

  userData.value.ready = true
}
watch(() => route.params, viewUser)
onMounted(viewUser)

const hideSensitiveInfo = ref(true)
function toggleSensitiveInfo() {
  hideSensitiveInfo.value = !toValue(hideSensitiveInfo)
}

async function followOrUnfollowUser(wantToUnfollow: boolean = false) {
  const userId = toValue(userData).userId

  if (wantToUnfollow) {
    const res = await unfollowUser(userId, 'web', user.chooseLtoken(), user.accountId, user.mihoyoId)
    if (res.retcode == HoyolabApiReturnCode.success) {
      userData.value.status.following = false
      // setFollowRelation()
    }
  }
  else {
    const res = await followUser(userId, 'web', user.chooseLtoken(), user.accountId, user.mihoyoId)
    if (res.retcode == HoyolabApiReturnCode.success) {
      userData.value.status.following = true
      // setFollowRelation()
    }
  }
}

function logout() {
  user.logout()
  setDeviceFp()
  needLogin.value = true
}

</script>

<template>
  <div class="login" v-if="needLogin && !route.params.userId">
    <div class="login-container">
      <h1>登录</h1>

      <v-tab :titles="loginMethods" @select="destroyLoginProcess">
        <v-tab-item>
          <div class="mihoyo-password">
            <v-text-input desc="用户" v-model="accountName" title="绑定手机或绑定邮箱" placeholder="绑定手机或绑定邮箱" icon="user" :allow-entering="false"></v-text-input>
            <v-text-input desc="密码" v-model="password" title="密码" placeholder="密码" icon="lock" password :allow-entering="false"></v-text-input>
            <v-button type="secondary" icon="right" @click="loginByPasswordThroughMihoyo">登录</v-button>
          </div>
        </v-tab-item>
        <v-tab-item>
          <div class="hoyolab-password">
            <v-text-input desc="用户" v-model="accountName" title="绑定手机或绑定邮箱" placeholder="绑定手机或绑定邮箱" icon="user" :allow-entering="false"></v-text-input>
            <v-text-input desc="密码" v-model="password" title="密码" placeholder="密码" icon="lock" password :allow-entering="false"></v-text-input>
            <span>不建议使用，成功概率较低。</span>
            <v-button type="secondary" icon="right" @click="loginByPasswordThroughHoyolab">登录</v-button>
          </div>
        </v-tab-item>
        <v-tab-item>
        </v-tab-item>
        <v-tab-item>
          <div class="hoyolab-qrcode">
            <img class="qrcode" ref="hoyolabQrcode">
            <span v-if="qrcodeCreativeTime">二维码生成于{{ formatTime(new Date(qrcodeCreativeTime)) }}</span>
            <span v-if="qrcodeScannedTime">二维码被扫描于{{ formatTime(new Date(qrcodeScannedTime)) }}</span>
            <span>该登录方式无法获取SToken，因此无法对文章进行操作，也无法查看游戏记录</span>
            <span>请使用米游社APP扫描此二维码并确认登录</span>
          </div>
        </v-tab-item>
        <v-tab-item>
          <div class="genshin-qrcode">
            <img class="qrcode" ref="genshinQrcode">
            <span v-if="qrcodeCreativeTime">二维码生成于{{ formatTime(new Date(qrcodeCreativeTime)) }}</span>
            <span v-if="qrcodeScannedTime">二维码被扫描于{{ formatTime(new Date(qrcodeScannedTime)) }}</span>
            <span>请使用米游社APP或《原神》扫描此二维码并确认登录</span>
          </div>
        </v-tab-item>
      </v-tab>
    </div>
  </div>

  <div class="user" v-else-if="userData && userData.ready">
    <div class="operation" v-if="user.loggedIn">

    </div>

    <div class="details" v-if="userData.userId">
      <div class="avatar">
        <img :src="userData.avatar" :title="userData.nickname" :alt="userData.userId">
      </div>

      <div class="info">
        <span class="nickname">{{ userData.nickname }}</span>
        <span class="account-id">米哈游通行证ID：{{ userData.userId }}</span>
        <p class="introduce" v-if="userData.introduce.trim()">{{ userData.introduce }}</p>
      </div>
    </div>

    <div class="stats">
      <ul>
        <li class="like">
          <v-icon type="like" size="20" theme="outline"></v-icon>
          <span>获得点赞</span>
          <span>{{ userData.data.like }}</span>
        </li>
        <li class="following">
          <v-icon type="rss" size="20" theme="outline"></v-icon>
          <span>关注</span>
          <span>{{ userData.data.following }}</span>
        </li>
        <li class="fans">
          <v-icon type="aiming" size="20" theme="outline"></v-icon>
          <span>粉丝</span>
          <span>{{ userData.data.fans }}</span>
        </li>
        <li class="post">
          <v-icon type="upload" size="20" theme="outline"></v-icon>
          <span>发布文章</span>
          <span>{{ userData.data.post }}</span>
        </li>
        <li class="reply-post">
          <v-icon type="share-two" size="20" theme="outline"></v-icon>
          <span>转发文章</span>
          <span>{{ userData.data.replyPost }}</span>
        </li>
        <li class="essence-post">
          <v-icon type="sunny" size="20" theme="outline"></v-icon>
          <span>精华文章</span>
          <span>{{ userData.data.essencePost }}</span>
        </li>
        <li class="topic">
          <v-icon type="comment" size="20" theme="outline"></v-icon>
          <span>创建话题</span>
          <span>{{ userData.data.topic }}</span>
        </li>
      </ul>
    </div>

    <div class="operation" v-if="user.loggedIn && user.accountId != userData.userId">
      <v-button type="primary" icon="rss" :icon-theme="['followedIt', 'followEachOther'].includes(followRelation) ? 'filled' : 'outline'" 
      @click="followOrUnfollowUser(userData.status.following)">{{ followRelation == 'followedIt' ? '取消关注' : 
      followRelation == 'followEachOther' ? '互相关注' : '关注' }}</v-button>
    </div>

    <div class="forum-level" v-if="userData.forumLevel">
      <ul>
        <li v-for="forumLevel in userData.forumLevel" :key="forumLevel.gameId">
          <div class="forum">
            <span>{{ hoyolabParentForum[Number(forumLevel.gameId)] }}</span>
          </div>
          <div class="data">
            <span class="level">{{ forumLevel.level }}</span>
            <span class="exp">{{ forumLevel.exp }}</span>
          </div>
        </li>
      </ul>
    </div>

    <div class="sensitive-info" v-if="userData.userId == user.accountId">
      <div class="operation">
        <v-button type="primary" icon="personal-privacy" @click="toggleSensitiveInfo">切换敏感信息</v-button>
        <v-button type="primary" icon="exit" @click="logout">登出</v-button>
      </div>

      <ul>
        <li><v-data-show desc="SToken V1" :data="user.stoken.v1 || '未获取'" :allow-operation="Boolean(user.stoken.v1)" :blur="hideSensitiveInfo"></v-data-show></li>
        <li><v-data-show desc="SToken V2" :data="user.stoken.v2 || '未获取'" :allow-operation="Boolean(user.stoken.v2)" :blur="hideSensitiveInfo"></v-data-show></li>
        <li><v-data-show desc="LToken V1" :data="user.ltoken.v1 || '未获取'" :allow-operation="Boolean(user.ltoken.v1)" :blur="hideSensitiveInfo"></v-data-show></li>
        <li><v-data-show desc="LToken V2" :data="user.ltoken.v2 || '未获取'" :allow-operation="Boolean(user.ltoken.v2)" :blur="hideSensitiveInfo"></v-data-show></li>
        <li><v-data-show desc="MiHoYo ID" :data="user.mihoyoId || '未获取'" :allow-operation="Boolean(user.mihoyoId)" :blur="hideSensitiveInfo"></v-data-show></li>
        <li><v-data-show desc="Game Token" :data="user.gameToken || '未获取'" :allow-operation="Boolean(user.gameToken)" :blur="hideSensitiveInfo"></v-data-show></li>
        <li><v-data-show desc="Login Ticket（临时）" :data="user.loginTicket || '未获取'" :allow-operation="Boolean(user.loginTicket)" :blur="hideSensitiveInfo"></v-data-show></li>
        <li><v-data-show desc="Hk4e Token（临时）" :data="user.hk4eToken || '未获取'" :allow-operation="Boolean(user.hk4eToken)" :blur="hideSensitiveInfo"></v-data-show></li>
        <li><v-data-show desc="Cookie Token（临时）" :data="user.cookieToken || '未获取'" :allow-operation="Boolean(user.cookieToken)" :blur="hideSensitiveInfo"></v-data-show></li>
      </ul>
    </div>
  </div>

  <div class="not-found" v-else>
    <span>正在加载中</span>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#login() {
  title-interval: 1em;
  padding: 0.5em 0.8em;
  input-margin: 0.5em 0;
  login-btn-margin: 1em 0;
  qrcode-blk-padding: 1em 0;
  qrcode-border: 1px solid #dark-login()[qrcode-border-color];
  qrcode-size: 12em;
  qrcode-radius: #border-radius()[medium];
  qrcode-margin: 2em 0;
}
#dark-login() {
  bg-color: lighten(#dark()[primary], 7%);
  title-color: lighten(#dark-text()[important], 10%);
  qrcode-border-color: darken(#dark()[content], 20%);
}
#user() {
  details-padding: 3em;
  sensitive-padding: 1em;
  forum-level-padding: 0.8em;
  details-interval: 1.5em;
  sensitive-interval: 1em;
  forum-level-interval: 1.1em;
  section-radius: #border-radius()[large-x];
  not-found-font-size: 3.5rem;
  not-found-interval: 1em;
  avatar-size: 9em;
  avatar-padding: 0.3em;
  nickname-font-size: 4rem;
  avatar-circle-size: 3px;
  introduce-padding: 0.4em;
  introduce-font-size: 0.8rem;
  introduce-radius: #border-radius()[medium];
  introduce-interval: 0.4em;
  sensitive-list-interval: 0.5em;
  sensitive-item-interval: 0.5em;
  operation-btn-interval: 0.4em;
  forum-level-data-padding: 0.3em 0.4em;
  forum-level-forum-padding: 0.4em 0.5em;
  forum-level-item-radius: #border-radius()[medium];
  forum-level-forum-font-size: 1.1rem;
  forum-level-level-font-size: 1.15rem;
  forum-level-exp-font-size: 0.95rem;
  forum-level-item-interval: 0.7em;
  forum-level-item-min-width: 13em;
  operation-interval: 0.3em;
  stats-interval: 0.4em;
  stats-item-radius: #border-radius()[medium];
  stats-item-padding: 0.3em 0.5em;
  stats-item-interval: 0.5em;
  stats-icon-interval: 0.4em;
  stats-data-font-size: 1.5rem;
}
#dark-user() {
  details-bg-color: lighten(#dark()[primary], 8%);
  avatar-bg-color: lighten(#dark()[secondary], 10%);
  avatar-circle-color: lighten(#color()[deepblue], 5%);
  nickname-color: lighten(#dark-text()[important], 8%);
  introduce-bg-color: lighten(#dark()[secondary], 13%);
  sensitive-bg-color: darken(#dark()[primary], 4%);
  forum-level-bg-color: lighten(#dark()[primary], 15%);
  forum-level-item-bg-color: lighten(#dark()[primary], 6%);
  forum-level-forum-bg-color: lighten(#dark()[secondary], 25%);
  stats-item-bg-color: lighten(#dark()[primary], 10%);
  stats-data-text-color: lighten(#dark-text()[important], 16%);
  not-found-color: lighten(#dark-text()[important], 18%);
}

.user {
  margin: auto;
  width: 60%;

  > div {
    border-radius: #user()[section-radius];
  }

  > .details {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    align-items: center;
    justify-content: space-between;
    background-color: #dark-user()[details-bg-color];
    padding: #user()[details-padding];
    margin-top: #user()[details-interval];

    > .avatar {
      border-radius: #border-radius()[circle];
      overflow: hidden;
      height: #user()[avatar-size];
      user-select: none;

      &::before {
        content: "";
        position: absolute;
        width: #user()[avatar-padding] + #user()[avatar-size];
        height: #user()[avatar-padding] + #user()[avatar-size];
        // background-color: #dark-user()[avatar-bg-color];
        border: #user()[avatar-circle-size] solid #dark-user()[avatar-circle-color];
        border-radius: #border-radius()[circle];
        transform: translate(0 - 2 * #user()[avatar-circle-size] + 2 * #user()[avatar-padding], 0 - 2 * #user()[avatar-circle-size] + 2 * #user()[avatar-padding]);
      }

      img {
        height: 100%;
      }
    }
    
    > .info {
      display: flex;
      flex-direction: column;

      .nickname {
        font-family: 'LXGW WenKai', sans-serif;
        font-size: #user()[nickname-font-size];
        color: #dark-user()[nickname-color];
      }

      .introduce {
        display: block;
        padding: #user()[introduce-padding];
        font-size: #user()[introduce-font-size];
        background-color: #dark-user()[introduce-bg-color];
        border-radius: #user()[introduce-radius];
        margin-top: #user()[introduce-interval];
      }
    }
  }

  > .stats {
    margin-top: #user()[stats-interval];

    > ul {
      list-style: none;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      flex-wrap: wrap;
      gap: #user()[stats-item-interval];

      > li {
        display: flex;
        flex-direction: row;
        align-items: center;
        border-radius: #user()[stats-item-radius];
        background-color: #dark-user()[stats-item-bg-color];
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        padding: #user()[stats-item-padding];

        .icon-container {
          margin-right: #user()[stats-icon-interval];
        }

        > span:nth-child(3) {
          color: #dark-user()[stats-data-text-color];
          font-size: #user()[stats-data-font-size];
        }
      }
    }
  }

  > .operation {
    margin-top: #user()[operation-interval];
    display: flex;
    justify-content: center;
  }

  > .forum-level {
    margin-top: #user()[forum-level-interval];
    padding: #user()[forum-level-padding];
    background-color: #dark-user()[forum-level-bg-color];

    > ul {
      list-style: none;
      display: flex;
      flex-wrap: wrap;
      gap: #user()[forum-level-item-interval];

      > li {
        border-radius: #user()[forum-level-item-radius];
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        align-items: stretch;
        overflow: hidden;
        // margin-right: #user()[forum-level-item-interval];
        // margin-bottom: #user()[forum-level-item-interval];
        min-width: #user()[forum-level-item-min-width];
        background-color: #dark-user()[forum-level-item-bg-color];

        .forum {
          font-size: #user()[forum-level-forum-font-size];
          padding: #user()[forum-level-forum-padding];
          background-color: #dark-user()[forum-level-forum-bg-color];
          display: flex;
          align-items: center;
          border-radius: #user()[forum-level-item-radius];
        }

        .data {
          flex-grow: 1;
          padding: #user()[forum-level-data-padding];
          display: flex;
          flex-direction: column;

          .level {
            font-weight: 600;
            font-size: #user()[forum-level-level-font-size];
          }

          .exp {
            font-size: #user()[forum-level-exp-font-size];
          }
        }
      }
    }
  }
  
  > .sensitive-info {
    background-color: #dark-user()[sensitive-bg-color];
    margin-top: #user()[sensitive-interval];
    padding: #user()[sensitive-padding];
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    flex-wrap: nowrap;

    > .operation {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;

      .button {
        margin-right: #user()[operation-btn-interval];

        &:last-child {
          margin-right: 0;
        }
      }
    }

    > ul {
      flex-grow: 1;
      display: flex;
      justify-content: center;
      flex-direction: row;
      flex-wrap: wrap;
      list-style: none;
      margin-top: #user()[sensitive-list-interval];
      gap: #user()[sensitive-item-interval];

      > li {
        width: 17.5em;
        height: 10em;

        // margin-right: #user()[sensitive-item-interval];
        // margin-bottom: #user()[sensitive-item-interval];

        .data-show {
          width: 100%;
          height: 100%;
        }
      }
    }
  }
}

.login {
  .login-container {
    padding: #login()[padding];
    width: 40%;
    height: 65%;
    background-color: #dark-login()[bg-color];
    position: fixed;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);

    h1 {
      color: #dark-login()[title-color];
      margin-bottom: #login()[title-interval];
      text-align: center;
    }

    .tab .tab-item {
      &:nth-child(1),
      &:nth-child(2) {
        .mihoyo-password,
        .hoyolab-password {
          display: flex;
          flex-direction: column;
          flex-wrap: nowrap;
          align-items: center;
          margin: auto;
          width: 65%;

          > .text-input {
            margin: #login()[input-margin];
          }

          > .button {
            margin: #login()[login-btn-margin];
          }
        }
      }

      &:nth-child(4),
      &:nth-child(5) {
        .hoyolab-qrcode,
        .genshin-qrcode {
          padding: #login()[qrcode-blk-padding];
          width: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
          align-items: center;

          img {
            border: #login()[qrcode-border];
            border-radius: #login()[qrcode-radius];
            width: #login()[qrcode-size];
            height: #login()[qrcode-size];
            margin: #login()[qrcode-margin];
          }
        }
      }
    }
  }
}

.not-found {
  margin: auto;
  text-align: center;
  font-size: #user()[not-found-font-size];

  span {
    display: block;
    margin-top: #user()[not-found-interval];
    color: #dark-user()[not-found-color];
  }
}

</style>