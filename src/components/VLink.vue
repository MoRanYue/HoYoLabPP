<script setup lang="ts">
import { useAttrs, type Ref, ref } from 'vue';
import { useMotion } from '@vueuse/motion';

const props = withDefaults(defineProps<{
  icon?: string,
  href?: string,
  target?: string
}>(), {
  href: '#',
  target: '_blank'
})
const attrs = useAttrs()
const url: string = <string>attrs.href ?? '#'
const target: string = <string>attrs.target ?? '_blank'

const icon = ref<HTMLElement>()
</script>

<template>
  <div class="link">
    <i class="icon" v-show="props.icon" ref="icon">ICON </i>

    <a :href="url" :target="target" class="link"><slot></slot></a>
  </div>
</template>

<style lang="less" scoped>
@import '@/assets/base.less';

#dark-link() {
  color: lighten(#dark()[special], 3%);
  underline-color: darken(#dark()[sub], 60%);

  hovering-color: lighten(#dark()[special], 20%);
  underline-hovering-color: darken(#dark()[sub], 40%);

  bg-color: lighten(#dark()[secondary], 1%);
}
#link() {
  transition-time: 0.5s;
  border-radius: #border-radius()[small];
  padding-hovering: 0.2em;
  underline-offset: 1px;
  underline-hovering-offset: 5px;
}

.link {
  display: inline-block;

  border-radius: #link()[border-radius];
  transition: #link()[transition-time];
  background: transparent;
  padding: 0;

  &:hover {
    background: #dark-link()[bg-color];
    padding: #link()[padding-hovering];
  }

  .icon {
    display: none;
  }

  a {
    cursor: pointer;
    color: #dark-link()[color];
    text-decoration: underline;
    text-decoration-color: #dark-link()[underline-color];
    text-underline-offset: #link()[underline-offset];
    transition: #link()[transition-time];
    
    &:hover {
      color: #dark-link()[hovering-color];
      text-decoration-color: #dark-link()[underline-hovering-color];
      text-underline-offset: #link()[underline-hovering-offset];
    }
  }
}

</style>
