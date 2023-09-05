<script setup lang="ts">
const props = withDefaults(defineProps<{
  src: string
}>(), {})
</script>

<template>
  <section class="frame-view">
    <iframe :src="props.src"></iframe>
  </section>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#frame-view() {

}
#dark-frame-view() {

}

</style>