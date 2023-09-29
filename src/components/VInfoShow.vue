<script setup lang="ts">
const props = withDefaults(defineProps<{
  title: string
  desc?: string
  info: string | number
}>(), {
  desc: ''
})
</script>

<template>
  <div class="info-show">
    <div class="title">
      <span :title="props.desc">{{ props.title }}</span>
    </div>
    <div class="info">
      <span>{{ props.info }}</span>
    </div>
  </div>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#info-show() {
  radius: #border-radius()[medium];
  info-padding: 0.3em 0.4em;
  title-padding: 0.4em 0.5em;
  title-font-size: 1.15rem;
  info-font-size: 1.1rem;
}
#dark-info-show() {
  bg-color: lighten(#dark()[secondary], 14%);
  title-bg-color: lighten(#dark()[secondary], 20%);
}

.info-show {
  border-radius: #info-show()[radius];
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: stretch;
  overflow: hidden;
  background-color: #dark-info-show()[bg-color];

  .title {
    font-size: #info-show()[title-font-size];
    padding: #info-show()[title-padding];
    background-color: #dark-info-show()[title-bg-color];
    display: flex;
    align-items: center;
    border-radius: #info-show()[radius];
    white-space: nowrap;
  }

  .info {
    display: flex;
    align-items: center;
    justify-content: center;
    flex-grow: 1;
    padding: #info-show()[info-padding];
    font-size: #info-show()[info-font-size];
  }
}

</style>