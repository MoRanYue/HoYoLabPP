<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useRoute } from 'vue-router';
import { ref, watch } from 'vue';
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
import VFrameView from '@/components/VFrameView.vue';
import type { NumberId } from '@/constants/Api';
import { cookieToDict, formatTime, randomChar } from '@/utils/utils';
import type { Dict } from '@/constants/TDict';

const route = useRoute()
const user = useUserStore()

let needLogin: boolean = true
if ((user.loggedIn && user.stoken) || route.params.userId) {
  needLogin = false
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
  await storeTokens(info.weblogin_token, info.account_id)
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
      notify(`${qrcodeStatus.retcode}：${qrcodeStatus.message}`, '查询二维码状态失败', 'error')

      qrcodeCreativeTime.value = undefined
      qrcodeScannedTime.value = undefined

      clearInterval(timer)
      return
    }

    const status = qrcodeStatus.data.status
    if (status == 'Created') {
      notify('已创建', '二维码状态', 'info')
    }
    else if (status == 'Scanned') {
      if (!toValue(qrcodeScannedTime)) {
        qrcodeScannedTime.value = Date.now()
      }
      notify('已扫描', '二维码状态', 'info')
    }
    else if (status == 'Confirmed') {
      notify('已确认登录', '二维码状态', 'success')
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

      notify('登录成功', '二维码状态', 'info')

      return
    }

  }, 1500)
}

async function storeTokens(loginTicket: string, accountId: NumberId) {
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
}

if (!user.deviceFingerprint) {
  getFingerprint().then(fp => {
    user.deviceFingerprint = <string>(fp.data.device_fp)
  })
}

function destroyLoginProcess(_, value: string) {
  isDestroyingRequest.value = true

  setTimeout(() => {
    if (toValue(isDestroyingRequest)) {
      isDestroyingRequest.value = false
    }
  }, 1700)
}

</script>

<template>
  <v-frame-view :src="verificationCode.src" v-if="verificationCode.isVerifing"></v-frame-view>

  <div class="login" v-if="needLogin">
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
  </div>
  <div class="user" v-else>

  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#user() {

}
#dark-user() {

}
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

.user {

}
</style>