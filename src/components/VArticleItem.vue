<script setup lang="ts">
import { ref } from 'vue'
import { useMotion } from '@vueuse/motion';
import { formatTime } from '@/utils/utils';
import VUserAnchor from './VUserAnchor.vue';
import VIcon from './VIcon.vue';

const props = withDefaults(defineProps<{
  title: string
  poster: {
    nickname: string,
    avatar?: string,
    userId?: number | string
  }
  time: {
    creating: number,
    updating: number
  }
  cover?: string
  postId: string
  stats: Partial<{
    like: number
    view: number
    reply: number
    bookmark: number
  }>
}>(), {
  cover: ''
})
const emits = defineEmits(['check'])

const cover = ref<HTMLElement>()

const coverAnimation = useMotion(cover, {
  initial: {
    opacity: 0,
    scale: 1
  },
  visibleOnce: {
    opacity: 1,
    transition: {
      type: 'tween',
      duration: 500
    }
  }
})

</script>

<template>
  <section class="article-item">
    <div class="text">
      <div class="title" @click="$emit('check', props.postId)">
        <span>{{ props.title }}</span>
      </div>

      <div class="content">
        <slot></slot>
      </div>

      <div class="footer">
        <v-user-anchor :nickname="props.poster.nickname" :avatar="props.poster.avatar" :user-id="props.poster.userId"></v-user-anchor>

        <div class="info">
          <v-icon type="upload" size="20" theme="outline" title="创建时间" :stroke-width="2" v-if="props.time.creating" content>{{ formatTime(new Date(props.time.creating * 1000)) }}</v-icon>
          <v-icon type="update-rotation" size="20" theme="outline" title="更新时间" :stroke-width="2" v-if="props.time.updating" content>{{ formatTime(new Date(props.time.updating * 1000)) }}</v-icon>

          <v-icon type="like" size="20" theme="outline" title="点赞" :stroke-width="2" v-if="props.stats.like" content>{{ props.stats.like }}</v-icon>
          <v-icon type="grinning-face-with-tightly-closed-eyes" title="浏览" size="20" theme="outline" :stroke-width="2" v-if="props.stats.view" content>{{ props.stats.view }}</v-icon>
          <v-icon type="comment" size="20" theme="outline" :stroke-width="2" title="评论" v-if="props.stats.reply" content>{{ props.stats.reply }}</v-icon>
          <v-icon type="bookmark" size="20" theme="outline" :stroke-width="2" title="收藏" v-if="props.stats.bookmark" content>{{ props.stats.bookmark }}</v-icon>
        </div>
      </div>
    </div>

    <div class="cover" v-if="props.cover" @click="$emit('check', props.postId)" ref="cover">
      <img :src="props.cover" :alt="props.postId" :title="props.title" loading="lazy">
    </div>
  </section>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#article-item() {
  padding: 0.8em 1em;
  interval: 0.8em;
  radius: #border-radius()[large];
  shadow: 5px 5px 5px 1px #dark-article-item()[shadow-color];
  cover-interval: 0.9em;
  cover-width: 12rem;
  cover-height: 8rem;
  cover-radius: #border-radius()[medium];
  title-radius: #border-radius()[small];
  title-padding: 0.3em 0.5em;
  title-size: 1.3rem;
  content-size: 0.9rem;
  title-interval: 0.6em;
  title-transition-time: 0.3s;
  footer-interval: 0.5em;
  stat-interval: 0.4em;
  content-line-height: 1.1rem;
}
#dark-article-item() {
  bg-color: lighten(#dark()[primary], 5%);
  shadow-color: darken(#dark()[secondary], 5%);
  title-bg-color: lighten(#dark()[primary], 10%);
  title-hover-bg-color: lighten(#dark()[primary], 13%);
  title-active-bg-color: lighten(#dark()[primary], 7%);
}

.article-item {
  display: flex;
  width: 100%;
  padding: #article-item()[padding];
  background-color: #dark-article-item()[bg-color];
  margin-top: #article-item()[interval];
  border-radius: #article-item()[radius];
  box-shadow: #article-item()[shadow];

  .cover {
    width: #article-item()[cover-width];
    height: #article-item()[cover-height];
    overflow: hidden;
    border-radius: #article-item()[cover-radius];
    margin-left: #article-item()[cover-interval];
    cursor: pointer;

    img {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .text {
    display: flex;
    flex-direction: column;
    align-items: flex-start;
    flex-grow: 1;

    .title {
      cursor: pointer;
      font-size: #article-item()[title-size];
      border-radius: #article-item()[title-radius];
      background-color: #dark-article-item()[title-bg-color];
      padding: #article-item()[title-padding];
      width: 100%;
      margin-bottom: #article-item()[title-interval];
      transition-duration: #article-item()[title-transition-time];

      &:hover {
        background-color: #dark-article-item()[title-hover-bg-color];
      }

      &:active {
        background-color: #dark-article-item()[title-active-bg-color];
      }
    }

    .content {
      line-height: #article-item()[content-line-height];
      flex-grow: 1;
      font-size: #article-item()[content-size];
      width: 100%;
    }

    .footer {
      width: 100%;
      display: flex;
      flex-wrap: nowrap;
      justify-content: space-between;
      align-items: center;
      margin-top: #article-item()[footer-interval];

      .info {
        display: flex;
        flex-wrap: nowrap;

        .icon-container {
          margin-left: #article-item()[stat-interval];
        }
      }
    }
  }
}

</style>