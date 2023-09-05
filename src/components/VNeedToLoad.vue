<script setup lang="ts">
import { LoadingType } from '../constants/ELoadingType';
import VIcon from './VIcon.vue';
import VLoading from './VLoading.vue';
import { type MaybeRef } from 'vue';

const props = withDefaults(defineProps<{
  isLoading: MaybeRef<boolean>
  isReady: MaybeRef<boolean>
  loadingAnimation?: keyof typeof LoadingType
}>(), {
  loadingAnimation: 'three-wire-surround'
})
</script>

<template>
  <slot v-if="props.isReady"></slot>
  <v-loading v-else-if="props.isLoading" type="three-wire-surround"></v-loading>
  <v-icon v-else type="big-x" theme="filled" size="48"></v-icon>
</template>

<style lang="less" scoped>
@import '@/assets/base.less';



</style>