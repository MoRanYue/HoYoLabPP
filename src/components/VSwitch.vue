<script setup lang="ts">
import { toValue } from '@vueuse/core';
import type { SwitchInfo } from '@/constants/TSwitchInfo';
import { ref, watch, onMounted, getCurrentInstance } from 'vue';

const props = withDefaults(defineProps<{
  choices: SwitchInfo
}>(), {

})
const emits = defineEmits(['choose'])
const inst = getCurrentInstance()

const choices = ref<HTMLElement>()

const choosedClass: string = 'active-choice'

function setDefaultChoice() {
  const choicesValue = toValue(choices)

  if (!choicesValue) {
    return
  }

  for (let i = 0; i < choicesValue.children.length; i++) {
    const choice = <HTMLLIElement>choicesValue.children[i];
    const choiceInfo = props.choices[i]
    
    if (choiceInfo.default) {
      if (choiceInfo.text == choice.textContent) {
        choice.className = choosedClass
        break
      }
    }
    else {
      if (i == choicesValue.children.length - 1) {
        choicesValue.children[0].className = choosedClass
      }
    }
  }
}

onMounted(setDefaultChoice)
watch(props, () => inst?.proxy?.$nextTick(setDefaultChoice))

function choose(text: string, value?: string) {
  const choicesValue = toValue(choices)

  if (!choicesValue) {
    return
  }

  for (let i = 0; i < choicesValue.children.length; i++) {
    const choice = <HTMLLIElement>choicesValue.children[i];

    if (choice.textContent == text) {
      if (choice.className == choosedClass) {
        return
      }

      choice.className = choosedClass
    }
    else {
      choice.className = ''
    }
  }

  emits('choose', value ?? text)
}
</script>

<template>
  <div class="switch" v-show="props.choices">
    <ul ref="choices">
      <li v-for="choice in props.choices" :key="choice.value" @click="choose(choice.text, choice.value)">
        {{ choice.text }}
      </li>
    </ul>
  </div>
</template>

<style lang="less" scoped>
@import '@/assets/base.less';

#switch() {
  radius: #border-radius()[large-xxx];
  padding: 0.3em;
  transition-time: 0.4s;  
  choice-transition-time: 0.2s;
  choice-padding: 0.4em 0.7em;
  choice-font-size: 1rem;
  choice-interval: 0.5em;
}
#dark-switch() {
  bg-color: darken(#dark()[secondary], 3%);
  active-bg-color: darken(#dark()[secondary], 1%);
  choice-bg-color: lighten(#dark()[secondary], 5%);
  choice-hover-bg-color: lighten(#dark()[secondary], 8%);
  choice-active-bg-color: lighten(#dark()[secondary], 11%);
  active-choice-bg-color: lighten(#dark()[secondary], 12%);
}

.switch {
  padding: #switch()[padding];
  border-radius: #switch()[radius];
  background-color: #dark-switch()[bg-color];
  transition-duration: #switch()[transition-time];
  width: fit-content;
  height: fit-content;

  &:active {
    background-color: #dark-switch()[active-bg-color];
  }

  ul {
    list-style: none;
    display: flex;
    flex-direction: row;

    li {
      border-radius: #switch()[radius];
      background-color: #dark-switch()[choice-bg-color];
      padding: #switch()[choice-padding];
      font-size: #switch()[choice-font-size];
      user-select: none;
      transition-duration: #switch()[choice-transition-time];

      &:hover {
        background-color: #dark-switch()[choice-hover-bg-color];
      }

      &:active {
        background-color: #dark-switch()[choice-active-bg-color];
      }
      
      margin-right: #switch()[choice-interval];
      &:last-child {
        margin-right: 0;
      }

      &.active-choice {
        background-color: #dark-switch()[active-choice-bg-color];
      }
    }
  }
}
</style>