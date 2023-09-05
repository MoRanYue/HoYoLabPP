<script setup lang="ts">
import { Shape } from '@N/EShape';

const props = withDefaults(defineProps<{
  decoration?: Shape,
  icon?: string,
}>(), {
  decoration: undefined,
  icon: undefined
})
</script>

<template>
  <li>
    <div class="list-item">
      <slot></slot>
    </div>
  </li>
</template>

<style lang="less" scoped>
@import '@AC/base.less';

.list-item {
  list-style: ~"v-bind('props.decoration')";
}
</style>
