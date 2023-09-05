<script setup lang="ts">
import { useUserStore } from '@/stores/user';
import { useRoute } from 'vue-router';
import { ref } from 'vue';
import { toValue } from '@vueuse/core';
import { getStokenAndLtokenByLoginTicket, loginMihoyoByPassword, loginMihoyoByPasswordCreateMmt, userInfo } from '@/api/interfaces';
import VTextInput from '@/components/VTextInput.vue';
import VIcon from '@/components/VIcon.vue';
import VButton from '@/components/VButton.vue';
import VTab from '@/components/VTab.vue';
import VTabItem from '@/components/VTabItem.vue';
import VFrameView from '@/components/VFrameView.vue';
import type { NumberId } from '@/constants/Api';

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

// verificationCode.value.isVerifing = true

const accountName = ref('')
const password = ref('')
async function loginByPasswordThroughMihoyo() {
  const mmtInfo = await loginMihoyoByPasswordCreateMmt(toValue(accountName))

  if (mmtInfo.data.status != 1) {
    console.error(mmtInfo.data.msg)
    return
  }
  if (mmtInfo.data.mmt_type == 1) {
    console.error('需要通过验证码')
    return
  }

  const mmtKey = mmtInfo.data.mmt_data.mmt_key
  const gt = mmtInfo.data.mmt_data.gt

  const accountInfo = await loginMihoyoByPassword(mmtKey, toValue(accountName), toValue(password))
  
  if (accountInfo.code != 200) {
    console.error(`登录失败：${accountInfo.data.msg}`)
    return
  }

  const info = accountInfo.data.account_info
  user.loggedIn = true
  user.loginTicket = info.weblogin_token
  user.accountId = String(info.account_id)
  await storeTokens(user.loginTicket, user.accountId)
}

async function storeTokens(loginTicket: string, accountId: NumberId) {
  const stokenAndLtoken = await getStokenAndLtokenByLoginTicket(loginTicket, accountId)
  stokenAndLtoken.data.list.forEach(token => {
    if (token.name == 'stoken') {
      user.stoken.v1 = token.token
    }
    else if (token.name == 'ltoken') {
      user.ltoken.v1 = token.token
    }
  });

  // const myInfo = await userInfo(user.accountId)
  // user.mihoyoId = myInfo.data.user_info
}


</script>

<template>
  <v-frame-view :src="verificationCode.src" v-if="verificationCode.isVerifing"></v-frame-view>

  <div class="login" v-if="needLogin">
    <div class="login-container">
      <h1>登录</h1>

      <v-tab :titles="loginMethods">
        <v-tab-item>
          <div class="mihoyo-password">
            <v-text-input desc="用户" v-model="accountName" title="绑定手机或绑定邮箱" placeholder="绑定手机或绑定邮箱" icon="user" :allow-entering="false"></v-text-input>
            <v-text-input desc="密码" v-model="password" title="密码" placeholder="密码" icon="lock" password :allow-entering="false"></v-text-input>
            <v-button type="secondary" icon="right" @click="loginByPasswordThroughMihoyo">登录</v-button>
          </div>
        </v-tab-item>
        <v-tab-item>

        </v-tab-item>
        <v-tab-item>
        </v-tab-item>
        <v-tab-item>
          <span>请使用米游社APP扫描此二维码并确认登录</span>
        </v-tab-item>
        <v-tab-item>
          <span>请使用米游社APP扫描此二维码并确认登录</span>
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
}
#dark-login() {
  bg-color: lighten(#dark()[primary], 7%);
  title-color: lighten(#dark-text()[important], 10%);
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
      &:nth-child(1) {
        .mihoyo-password {
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
    }
  }
}

.user {

}
</style>