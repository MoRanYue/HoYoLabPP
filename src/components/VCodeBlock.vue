<script setup lang="ts">
import { Ref, computed, onMounted, ref, unref } from 'vue';
import { useClipboard } from '@vueuse/core';
import VButton from '@C/VButton.vue';
import { ProgrammingLanguageName } from '@N/EProgrammingLanguageName';

const props = withDefaults(defineProps<{
  language?: string
  allowCopy?: boolean
}>(), {
  language: 'Text',
  allowCopy: true
})

let language: string = props.language || 'Text'
for (const lang in ProgrammingLanguageName) {
  if (Object.prototype.hasOwnProperty.call(ProgrammingLanguageName, lang)) {
    const pattern: RegExp = RegExp('^' + ProgrammingLanguageName[lang] + '$', 'gi');

    if (pattern.test(props.language)) {
      language = lang
      break
    }
  }
}

const { copy, copied } = useClipboard()

const sourceCode = ref<HTMLElement>()

let code: string = ''
let result: Ref<string | undefined> = ref<string>()
onMounted(() => {
  code = unref(sourceCode)?.innerText ?? ''
  const everyLine: string[] = code.trim().split('\n')

  let resultCode: string = ''
  let resultLine: string = ''
  let lineCount: number = 0
  if (Array.isArray(everyLine)) {
    for (let i = 0; i < everyLine.length; i++) {
      const line: string = everyLine[i];
      
      lineCount++
      resultLine += `<span>${lineCount}</span><br>`
      resultCode += `<span>${line.replaceAll('<', '&lt;').replaceAll('>', '&gt;')}</span><br>`
    }
  }

  result.value = '<div class="line">' + resultLine + '</div>' + '<div class="code">' + resultCode + '</div>'
})


</script>

<template>
  <div class="code-block block-shadow">
    <div class="code-block-info">
      <div class="language">
        {{ language }}
      </div>
      <div class="copy-btn">
        <v-button v-if="allowCopy" type="secondary" @click="copy(code.replaceAll('\u00a0', ' ') ?? '')">{{ $t('general.copy') }}</v-button>
      </div>
    </div>

    <code v-html="result">
    </code>
    <span ref="sourceCode" v-show="!result">
      <slot></slot>
    </span>
  </div>
</template>

<style lang="less" scoped>
@import '@AC/base.less';

#dark-code-block() {
  bg-color: lighten(#dark()[primary], 4%);
  color: lighten(#dark()[content], 8%);
  line-color: darken(#dark()[sub], 10%);
  line-bg-color: darken(#dark()[secondary], 1%);
}
#dark-code-block-info() {
  bg-color: lighten(#dark()[primary], 10%);
  button-bg-color: lighten(#dark()[primary], 6%);
}
#code-block() {
  border-radius: #border-radius()[large];
  code-padding: 1em 0 0.2em 1em;
  line-padding: 1em 0.8em 0.8em 1em;
  margin: 0.7em 0;
}
#code-block-info() {
  padding: 0.6em 0.7em;
  button-padding: 0em 1em;
}

.code-block {
  background-color: #dark-code-block()[bg-color];
  border-radius: #code-block()[border-radius];
  margin: #code-block()[margin];
  height: fit-content;
  overflow: hidden;
  
  display: flex;
  flex-direction: column;

  code {
    display: flex;
    flex-direction: row;
    white-space: nowrap;

    :deep(.line) {
      padding: #code-block()[line-padding];
      background-color: #dark-code-block()[line-bg-color];
      font-family: Arial, Helvetica, sans-serif;
      width: fit-content;

      > span {
        user-select: none;
        font-style: italic;
        color:  #dark-code-block()[line-color];
      }
    }
    :deep(.code) {
      width: 100%;
      height: 100%;
      padding: #code-block()[code-padding];
      font-family: 'Courier New', Courier, monospace;
      overflow: auto hidden;

      > span {
        color: #dark-code-block()[color];
      }
    }
  }

  .code-block-info {
    background-color: #dark-code-block-info()[bg-color];

    overflow: hidden;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    justify-content: flex-start;
    align-items: center;

    .language {
      white-space: nowrap;
      flex-grow: 1;
      height: 100%;
      overflow: hidden;
      font-weight: bold;
      text-transform: capitalize;
      padding: #code-block-info()[padding];
    }
    .copy-btn {
      flex-shrink: 0;
      background-color: #dark-code-block-info()[button-bg-color];
      padding: #code-block-info()[padding];
    }
  }
}

</style>
