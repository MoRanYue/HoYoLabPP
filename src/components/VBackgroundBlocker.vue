<script setup lang="ts">
const props = withDefaults(defineProps<{
  layer: number | string
}>(), {
  layer: 1
})
</script>

<template>
  <div class="blocker">
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#background-blocker() {
  blur-radius: 5px;
}
#dark-background-blocker() {
  bg-color: rgba(0, 0, 0, 0.3);
}

.blocker {
  z-index: ~"v-bind(props.layer)";
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  right: 0;
  background-color: #dark-background-blocker()[bg-color];
  backdrop-filter: blur(#background-blocker()[blur-radius]);
}

</style>