<script setup lang="ts">
import { notify } from '@/utils/notification'
import { hoyolabCreateVerification, hoyolabVerifyVerification } from '@/api/interfaces';
import { useUserStore } from '@/stores/user';
import { ref, watch } from 'vue'
import { useElementVisibility } from '@vueuse/core'
import VBackgroundBlocker from './VBackgroundBlocker.vue';
import { HoyolabApiReturnCode } from '@/constants/Api';

const props = withDefaults(defineProps<{
  challenge?: string
  gt?: string
  version?: 3 | 4
}>(), {
  version: 3
})
const emits = defineEmits(['finish', 'error'])

const user = useUserStore()

async function autoStart() {

  const verificationInfo = await hoyolabCreateVerification(user.chooseStoken(), user.accountId, user.mihoyoId)
  if (verificationInfo.retcode != HoyolabApiReturnCode.success) {
    notify(verificationInfo.message, '错误', 'error')
    return
  }

  initGeetest({
    gt: props.gt ?? verificationInfo.data.gt,
    challenge: props.challenge ?? verificationInfo.data.challenge,
    offline: false,
    new_captcha: true,

    product: 'popup',
    next_width: '90%',
    bg_color: 'black',
  }, captchaObj => {
    captchaObj.appendTo('#verification-view')

    captchaObj.onReady(() => {
    }).onSuccess(() => {
      notify('验证成功', '验证码', 'success')

      const validation = captchaObj.getValidate()

      const seccode = validation.geetest_seccode
      const validate = validation.geetest_validate

      hoyolabVerifyVerification(props.challenge ?? verificationInfo.data.challenge, validate, seccode, user.chooseStoken(), user.accountId, user.mihoyoId).then(res => {
        if (res.retcode != HoyolabApiReturnCode.success) {
          emits('error', res.retcode)
        }

        emits('finish')
      })
    }).onError(err => {
      notify(`验证错误：${err}`, '验证码', 'error')
      emits('error', err)
      emits('finish')
    })
  })
}

const view = ref<HTMLElement>()

const isTimeToValidate = useElementVisibility(view)
watch(isTimeToValidate, needValidate => {
  if (needValidate) {
    autoStart()
  }
})
</script>

<template>
  <section id="verification-view" ref="view">
  </section>
  <v-background-blocker layer="6"></v-background-blocker>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#verification-view() {

}
#dark-verification-view() {

}

#verification-view {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 7;
}

</style>