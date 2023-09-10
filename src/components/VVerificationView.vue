<script setup lang="ts">
import { notify } from '@/utils/notification'
import { hoyolabCreateVerification, hoyolabVerifyVerification } from '@/api/interfaces';
import { useUserStore } from '@/stores/user';
import { ref, watch } from 'vue'
import { useElementVisibility } from '@vueuse/core'
import VBackgroundBlocker from './VBackgroundBlocker.vue';

const props = withDefaults(defineProps<{
}>(), {})
const emits = defineEmits(['finish'])

const user = useUserStore()

async function start() {
  const verificationInfo = await hoyolabCreateVerification(user.chooseStoken(), user.accountId, user.mihoyoId)
  if (verificationInfo.retcode != 0) {
    notify(verificationInfo.message, '错误', 'error')
    return
  }

  initGeetest({
    gt: verificationInfo.data.gt,
    challenge: verificationInfo.data.challenge,
    offline: false,
    new_captcha: true,

    product: 'popup',
    // area: '#verification-view',
    next_width: '90%',
    bg_color: 'black',
  }, (captchaObj) => {
    captchaObj.appendTo('#verification-view')

    captchaObj.onReady(() => {
    }).onSuccess(() => {
      notify('验证成功', '验证码', 'success')

      const validation = captchaObj.getValidate()

      const seccode = validation.geetest_seccode
      const validate = validation.geetest_validate

      hoyolabVerifyVerification(verificationInfo.data.challenge, validate, seccode, user.chooseStoken(), user.accountId, user.mihoyoId).then(res => {
        if (res.retcode != 0) {
          notify(res.message, '验证失败', 'failure')
        }

        emits('finish')
      })
    }).onError(() => {
      notify('验证错误', '验证码', 'error')
    })
  })
}

const view = ref<HTMLElement>()

const isTimeToValidate = useElementVisibility(view)
watch(isTimeToValidate, needValidate => {
  if (needValidate) {
    start()
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