<script setup lang="ts">
import type { ProjectLink } from '@/constants/IProjectLink';
import VIcon from './VIcon.vue';

const props = withDefaults(defineProps<{
  platform: keyof ProjectLink
  url: string
}>(), {})

const icons: Record<keyof ProjectLink, string> = {
  gitHub: 'github',
  gitLab: 'gitlab',
  gitee: 'github-one',
  officalWebsite: 'four-point-connection',
  hostedWebsite: 'anchor',
  appStore: 'app-store'
}
const platformNames: Record<keyof ProjectLink, string> = {
  gitHub: 'GitHub',
  gitLab: 'GitLab',
  gitee: 'Gitee',
  officalWebsite: '官方网站',
  hostedWebsite: '托管网站',
  appStore: '已上架应用商店'
}
</script>

<template>
  <li class="link-item">
    <a :href="props.url" :title="platformNames[props.platform]" target="_blank"><v-icon size="40" theme="filled" :type="icons[props.platform]"></v-icon></a>
  </li>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#home-similar-project-item-link-item() {
  padding: 0.2em;
}
#dark-home-similar-project-item-link-item() {
  bg-color: darken(#dark()[secondary], 3%);
  color: lighten(#dark-text()[important], 18%);
}

.link-item {
  padding: #home-similar-project-item-link-item()[padding];
  background-color: #dark-home-similar-project-item-link-item()[bg-color];
  border-radius: #border-radius()[circle];

  a {
    color: #dark-home-similar-project-item-link-item()[color];
  }
}

</style>