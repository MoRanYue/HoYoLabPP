<script setup lang="ts">
import VIcon from './VIcon.vue';
import VButton from './VButton.vue';
import { randomChar } from '@/utils/utils'
import { ref } from 'vue';

const props = withDefaults(defineProps<{
  icon?: string
  title?: string
  placeholder?: string
  desc?: string
  password?: boolean
  allowOperation?: boolean
  allowCleaning?: boolean
  allowEntering?: boolean
  modelValue?: string
}>(), {
  placeholder: '请输入文本',
  title: '文本',
  allowOperation: true,
  allowCleaning: true,
  allowEntering: true,
  password: false
})
const emits = defineEmits(['input', 'finish', 'update:modelValue'])

const inputId = ref(randomChar(8))

const input = ref<HTMLInputElement>()

function clean() {
  const timer = setInterval(() => {
    const value = input.value!.value

    input.value!.value = value.slice(undefined, value.length - 1)

    if (input.value!.value.length <= 0) {
      clearInterval(timer)
    }
  }, Math.max(1, 500 / input.value!.value.length))
}

function inputEv() {
  emits('input', input.value?.value)
  emits('update:modelValue', input.value?.value)
}
</script>

<template>
  <div class="text-input">
    <div class="desc" v-if="props.desc">
      <label :for="`input-${inputId}`">{{ props.desc }}</label>
    </div>

    <div class="input-area">
      <div class="tip" v-if="props.icon">
        <v-icon :type="props.icon" :stroke-width="1" size="24" theme="outline"></v-icon>
        <div class="dividing"></div>
      </div>

      <input :type="props.password ? 'password' : 'text'" :id="`input-${inputId}`" :placeholder="props.placeholder" 
      ref="input" :title="props.title" @input="inputEv">

      <div class="operation" v-if="props.allowOperation">
        <div class="dividing"></div>
        <v-button icon="close-one" type="icon" @click="clean" v-if="props.allowCleaning"></v-button>
        <v-button icon="right" type="icon" @click="emits('finish', input?.value)" v-if="props.allowEntering"></v-button>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#text-input() {
  padding: 0.4em 0.6em;
  desc-padding: 0.3em 0.5em;
  dividing-margin: 0 0.4em;
  radius: #border-radius()[medium];
  desc-radius: #border-radius()[small];
  transition-time: 0.2s;
  operation-btn-interval: 0.4em;
}
#dark-text-input() {
  bg-color: darken(#dark()[primary], 3%);
  dividing-color: darken(#dark()[sub], 20%);
  text-color: darken(#dark-text()[color], 5%);
  text-focus-color: lighten(#dark-text()[color], 2%);
  text-selection-bg-color: lighten(#dark()[primary], 4%);
  desc-text-color: darken(#dark-text()[color], 5%);
  desc-bg-color: lighten(#dark()[secondary], 1%);
  placeholder-color: darken(#dark-text()[disabled], 2%);
}

.text-input {
  width: 100%;
  display: flex;
  flex-direction: row;
  align-items: center;

  .desc {
    background-color: #dark-text-input()[desc-bg-color];
    padding: #text-input()[desc-padding];
    border-radius: #text-input()[desc-radius];
    border-top-right-radius: 0;
    border-bottom-right-radius: 0;

    label {
      color: #dark-text-input()[desc-text-color];
    }
  }
  
  .input-area{
    flex-grow: 1;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    background-color: #dark-text-input()[bg-color];
    padding: #text-input()[padding];
    border-radius: #text-input()[radius];

    .dividing {
      background-color: #dark-text-input()[dividing-color];
      width: 1px;
      height: 80%;
      margin: #text-input()[dividing-margin];
    }

    > .tip {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;
    }

    > .operation {
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      align-items: center;

      > .button {
        margin-right: #text-input()[operation-btn-interval];

        &:last-child {
          margin-right: 0;
        }
      }
    }

    > input {
      flex-grow: 1;
      outline: none;
      background: none;
      border: 0;
      color: #dark-text-input()[text-color];
      transition-duration: #text-input()[transition-time];

      &:focus {
        color: #dark-text-input()[text-focus-color];
      }

      &::selection {
        background-color: #dark-text-input()[text-selection-bg-color];
      }

      &::placeholder {
        color: #dark-text-input()[placeholder-color];
      }
    }
  }
}

</style>