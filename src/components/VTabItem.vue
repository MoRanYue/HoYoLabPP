<script setup lang="ts">
</script>

<template>
  <li class="tab-item">
    <slot></slot>
  </li>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#tab-item() {
  radius: #border-radius()[large];
}
#dark-tab-item() {
  bg-color: lighten(#dark()[primary], 12%);
}

.tab-item {
  background-color: #dark-tab-item()[bg-color];
  border-radius: #tab-item()[radius];
  border-top-left-radius: 0;
  border-top-right-radius: 0;
}

</style>