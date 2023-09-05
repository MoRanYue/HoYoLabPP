<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
import VAsideNavigation from './components/VAsideNavigation.vue';
import VButton from './components/VButton.vue';
import type { NavigationItem } from './constants/INavigationItem';
import { ref, getCurrentInstance } from 'vue';
import { toValue } from '@vueuse/core';

const inst = getCurrentInstance()

const metaData: {
  siteName: string
  icon: string
  navItems: NavigationItem[]
} = {
  siteName: "HoYoLab PP",
  icon: "https://www.miyoushe.com/mainPage/ys-logo-v2.png",
  navItems: [
    {text: '首页', route: '/home', logo: 'home'},
    {text: '文章', route: '/article', logo: 'cones'},
    {text: '游戏记录', route: '/gameRecord', logo: 'data'},
    {text: '抽卡统计', route: '/drawingStatistic', logo: 'optimize'},
    {text: '游戏工具', route: '/gameTool', logo: 'tool'},
    {text: '账号', route: '/user', logo: 'user'},
    // {text: '关于', route: '/about', logo: 'bill'},
  ]
}

let renderNavigation = ref(true)
function resetNavigation() {
  if (!toValue(renderNavigation)) {
    return
  }

  renderNavigation.value = false
  inst!.proxy!.$nextTick().then(() => {
    renderNavigation.value = true
  })
}
function toggleNavigation() {
  renderNavigation.value = !toValue(renderNavigation)
}

</script>

<template>
  <header>
    
  </header>

  <aside>
    <v-aside-navigation v-if="renderNavigation" draggable :site-name="metaData.siteName" :nav-items="metaData.navItems" :logo="metaData.icon"></v-aside-navigation>
  </aside>

  <main>
    <router-view></router-view>
  </main>

  <footer>
    <div class="navigation-control">
      <v-button class="reset-navigation" icon="refresh" @click="resetNavigation">重置导航</v-button>
      <v-button class="toggle-navigation" icon="switch" @click="toggleNavigation">切换导航</v-button>
    </div>
  </footer>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#app() {
  navigation-control-right: 1em;
  navigation-control-bottom: 1em;
  navigation-control-btn-interval: 3.5em;
}
#dark-app() {

}

* {
  color: #dark-text[color];
}

.navigation-control {
  .button {
    z-index: 999;
    position: fixed;
    right: #app()[navigation-control-right];
    bottom: #app()[navigation-control-bottom];

    each(range(0, 2), {
      &:nth-child(@{value}) {
        margin-bottom: (@value - 1) * #app()[navigation-control-btn-interval];
      }
    })
  }
}
</style>
