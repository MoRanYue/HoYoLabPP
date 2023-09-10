<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useRoute } from 'vue-router';
import { ref, watch, type Ref, onMounted } from 'vue';
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
  checkHoyolabQrcodeStatus
} from '@/api/interfaces';
import VTextInput from '@/components/VTextInput.vue';
import VIcon from '@/components/VIcon.vue';
import VButton from '@/components/VButton.vue';
import VTab from '@/components/VTab.vue';
import VTabItem from '@/components/VTabItem.vue';
import VDataShow from '@/components/VDataShow.vue';
import type { NumberId } from '@/constants/Api';
import { cookieToDict, formatTime, randomChar } from '@/utils/utils';
import type { Dict } from '@/constants/TDict';

const route = useRoute()
const user = useUserStore()

let needLogin = ref(true)
if (user.loggedIn) {
  needLogin.value = false
}

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
    notify('需要通过验证码', '登录失败', 'error')
    return
  }

  const mmtKey = mmtInfo.data.mmt_data.mmt_key
  const gt = mmtInfo.data.mmt_data.gt

  const accountInfo = await loginMihoyoByPassword(mmtKey, toValue(accountName), toValue(password))
  
  if (accountInfo.code != 200) {
    notify(`${accountInfo.code}：${accountInfo.message}`, '登录失败', 'error')
    return
  }

  const info = accountInfo.data.account_info
  await storeTokensWithLoginTicket(info.weblogin_token, info.account_id)
}

async function loginByPasswordThroughHoyolab() {
  const accountInfo = await loginHoyolabByPassword(toValue(accountName), toValue(password))
  console.log(accountInfo)
}

const qrcodeCreativeTime = ref<number>()
const qrcodeScannedTime = ref<number>()
async function loginByQrcodeThroughHoyolab() {
  const deviceId = randomChar(8)

  const qrcodeInfo = await generateHoyolabQrcode(deviceId)
  if (qrcodeInfo.retcode != 0) {
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

    if (qrcodeStatus.retcode != 0) {
      qrcodeCreativeTime.value = undefined
      qrcodeScannedTime.value = undefined
      hoyolabQrcode.value.src = ''

      clearInterval(timer)
      return await loginByQrcodeThroughHoyolab()
    }

    const status = qrcodeStatus.data.status
    if (status == 'Created') {
      notify('已创建', '二维码状态')
    }
    else if (status == 'Scanned') {
      if (!toValue(qrcodeScannedTime)) {
        qrcodeScannedTime.value = Date.now()
      }
      notify('已扫描', '二维码状态')
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

      user.accountId = tokens.account_id_v2
      user.mihoyoId = tokens.account_mid_v2
      user.cookieToken = tokens.cookie_token_v2
      user.ltoken.v2 = tokens.ltoken_v2

      notify('登录成功', '二维码状态', 'success')

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

function destroyLoginProcess(_, value: string) {
  isDestroyingRequest.value = true

  setTimeout(() => {
    if (toValue(isDestroyingRequest)) {
      isDestroyingRequest.value = false
    }
  }, 1700)
}

const userData: Ref<{
  nickname: string
  userId: NumberId
  avatar: string
  introduce: string
}> = ref({
  nickname: '',
  userId: '',
  avatar: '',
  introduce: ''
})

onMounted(async () => {
  const specialUserId = route.params.userId
  let userDataRes: Dict
  if (specialUserId) {
    userDataRes = await userInfo(specialUserId, 'web', user.chooseLtoken(), user.accountId, user.mihoyoId)
  }
  else {
    userDataRes = await userInfo(user.accountId, 'web', user.chooseLtoken(), user.accountId, user.mihoyoId)
  }

  if (userDataRes.retcode != 0) {
    return
  }

  const info = userDataRes.data.user_info
  userData.value.nickname = info.nickname
  userData.value.avatar = info.avatar_url
  userData.value.userId = info.uid
  userData.value.introduce = info.introduce
})

const hideSensitiveInfo = ref(true)
function toggleSensitiveInfo() {
  hideSensitiveInfo.value = !toValue(hideSensitiveInfo)
}

function logout() {
  user.logout()
  setDeviceFp()
  needLogin.value = true
}

</script>

<template>
  <section class="login" v-if="needLogin && !route.params.userId">
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
            <span>请使用米游社APP扫描此二维码并确认登录</span>
          </div>
        </v-tab-item>
        <v-tab-item>
          <div class="genshin-qrcode">
            <img class="qrcode" ref="genshinQrcode">
            <span>请使用米游社APP或《原神》扫描此二维码并确认登录</span>
          </div>
        </v-tab-item>
      </v-tab>
    </div>
  </section>

  <section class="user" v-else>
    <div class="operation" v-if="user.loggedIn">

    </div>

    <div class="details" v-if="userData.userId">
      <div class="avatar">
        <img :src="userData.avatar" :title="userData.nickname" :alt="userData.userId">
      </div>

      <div class="info">
        <span class="nickname">{{ userData.nickname }}</span>
        <span class="account-id">米哈游通行证ID：{{ userData.userId }}</span>
        <p class="introduce">{{ userData.introduce }}</p>
      </div>
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
  </section>
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
  details-interval: 1.5em;
  sensitive-interval: 1em;
  section-radius: #border-radius()[large-x];
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
}
#dark-user() {
  details-bg-color: lighten(#dark()[primary], 8%);
  avatar-bg-color: lighten(#dark()[secondary], 10%);
  avatar-circle-color: lighten(#color()[deepblue], 5%);
  nickname-color: lighten(#dark-text()[important], 8%);
  introduce-bg-color: lighten(#dark()[secondary], 13%);
  sensitive-bg-color: darken(#dark()[primary], 4%);
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
        transform: translate(0 - 2 * #user()[avatar-circle-size] - 0 * #user()[avatar-padding], 0 - 2 * #user()[avatar-circle-size] - 0 * #user()[avatar-padding]);
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

      > li {
        width: 17.5em;
        height: 10em;

        margin-right: #user()[sensitive-item-interval];
        margin-bottom: #user()[sensitive-item-interval];

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

</style>