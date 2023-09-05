<script setup lang="ts">
</script>

<template>
  <blockquote class="blockquote">
    <div>
      <slot></slot>
    </div>
  </blockquote>
</template>

<style lang="less" scoped>
@import '@/assets/base.less';

#dark-blockquote() {

}
#blockquote() {

}

blockquote {
  background-color: wheat;
}

</style>
