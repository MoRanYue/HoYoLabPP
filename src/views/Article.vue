<script setup lang="ts">
import { useAsyncState, watchOnce, toRef, useElementVisibility } from '@vueuse/core';
import { requestMihoyo } from '@/api/dynamicSignProcessor'
import { articleInfo, homeInfo, dynamicData } from '@/api/interfaces'
import { ref, watch, type Ref } from "vue";
import { useRoute } from 'vue-router';
import VNeedToLoad from '@/components/VNeedToLoad.vue';
import VArticleView from '@/components/VArticleView.vue';
import VArticleItem from '@/components/VArticleItem.vue';
import VIcon from '@/components/VIcon.vue';
import VTextInput from '@/components/VTextInput.vue'
import { useUserStore } from '@/stores/user'
import type { Dict } from '@/constants/TDict';
import type { NumberId } from '@/constants/Api';
import type { UserAnchorInfo } from '@/constants/IUserAnchorInfo';

const user = useUserStore()

const route = useRoute()

let page: number = 1
const { isLoading: homeIsLoading, isReady: homeIsReady, state: homeState, error: homeError } = useAsyncState(homeInfo(2, page, 20), undefined)

const articleEnd = ref<HTMLElement>()
const isTimeToRefresh = useElementVisibility(articleEnd)

const recommendedPosts = ref([])
async function refreshArticle(append: boolean = false) {
  if (append) {
    page++
  }

  const res = await homeInfo(2, page, 20)

  res.data.recommended_posts.forEach(article => {
    recommendedPosts.value.push(article)
  });
}
watch(isTimeToRefresh, (needRefresh) => {
  if (needRefresh) {
    refreshArticle(true)
  }
})
watch(homeError, (err) => {
  console.error(err)
})
watch(homeState, (state) => {
  recommendedPosts.value = state.data.recommended_posts
})

watch(recommendedPosts, async (posts) => {
  const postIds: number[] = []
  posts.forEach(post => {
    postIds.push(post.post.post_id)
  });

  const articleDynamicInfo = await dynamicData(postIds)
  if (articleDynamicInfo.retcode != 0) {
    return
  }

  articleDynamicInfo.data.list.forEach((info, i) => {
    recommendedPosts.value[i].stat = info.stat
  });
})

const currentArticle: Ref<{
  isBrowsing: boolean
  title: string
  content: string
  postId: NumberId
  postViewType: number
  postImages?: string[]
  isLoading: boolean
  isReady: boolean
  stats: {
    like: number
    reply: number
    view: number
    bookmark: number
    forward: number
  }
  poster: UserAnchorInfo
  time: {
    creating: number
    updating: number
  }
  status: {
    liked: boolean
    collected: boolean
  }
}> = toRef({
  isBrowsing: false,
  title: '未定义',
  content: '',
  postId: '0',
  isLoading: toRef(false),
  isReady: toRef(false),
  postViewType: 1,
  postImages: [],
  stats: {
    like: 0,
    reply: 0,
    view: 0,
    bookmark: 0,
    forward: 0
  },
  poster: {
    nickname: '',
    userId: undefined,
    avatar: undefined
  },
  time: {
    creating: 0,
    updating: 0
  },
  status: {
    liked: false,
    collected: false
  }
})
async function viewPost(postId: string) {
  const postInfo = await articleInfo(postId, user.stoken.v2, user.accountId, user.mihoyoId)

  // 暂时先这样
  if (postInfo.retcode != 0) {
    return
  }
  currentArticle.value.isBrowsing = true

  const post = postInfo.data.post
  currentArticle.value.title = post.post.subject
  currentArticle.value.content = post.post.structured_content
  currentArticle.value.postId = post.post.post_id
  currentArticle.value.postViewType = post.post.view_type
  currentArticle.value.postImages = post.post.images
  currentArticle.value.poster = {
    userId: post.user.uid,
    avatar: post.user.avatar_url,
    nickname: post.user.nickname
  }
  currentArticle.value.time = {
    creating: post.post.created_at,
    updating: post.post.updated_at
  }
  currentArticle.value.stats = {
    like: post.stat.like_num,
    reply: post.stat.reply_num,
    bookmark: post.stat.bookmark_num,
    forward: post.stat.forward_num,
    view: post.stat.view_num
  }
  currentArticle.value.status = {
    liked: post.self_operation.attitude == 1,
    collected: post.self_operation.is_collected
  }
  console.log(currentArticle.value.status)
}

if (route.params.postId) {
  viewPost(<string>route.params.postId)
}

</script>

<template>
  <section v-show="currentArticle.isBrowsing">
    <v-article-view :post-id="currentArticle.postId" :time="currentArticle.time" :poster="currentArticle.poster" 
    :status="currentArticle.status" :content="currentArticle.content" :title="currentArticle.title" 
    :stats="currentArticle.stats" :post-view-type="currentArticle.postViewType" @close="currentArticle.isBrowsing = false"
    :is-loading="currentArticle.isLoading" :is-ready="currentArticle.isReady" :post-images="currentArticle.postImages"></v-article-view>
  </section>

  <div class="article">
    <div class="search">
      <v-text-input icon="search" title="搜索文章" placeholder="搜索文章"></v-text-input>
      <v-text-input icon="target" title="文章ID" placeholder="请输入文章ID" @finish="viewPost"></v-text-input>
    </div>

    <v-need-to-load :is-loading="homeIsLoading" :is-ready="homeIsReady">
      <div class="recommended-posts">
        <ul>
          <li v-for="post in recommendedPosts" :key="post.post.post_id">
            <v-article-item :post-id="post.post.post_id" :title="post.post.subject" :cover="post.post.cover || post.cover?.url" 
            :poster="{nickname: post.user.nickname, avatar: post.user.avatar_url, userId: post.user.uid}"
            :stats="{like: post.stat.like_num, view: post.stat.view_num, reply: post.stat.reply_num, bookmark: post.stat.bookmark_num}"
            :time="{creating: post.post.created_at}" @check="viewPost">
              {{ post.post.content }}
            </v-article-item>
          </li>
        </ul>
      </div>

      <v-icon theme="filled" type="endless" content ref="articleEnd">还要康嘛？</v-icon>
    </v-need-to-load>
  </div>
</template>

<style scoped lang="less">
@import "@/assets/base.less";

#article() {
  operation-margin: 1em 0 0 0;
  operation-inp-interval: 0.5em;
}
#dark-article() {
}

.article {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: auto;
  width: 60%;

  .search {
    width: 100%;
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    margin: #article()[operation-margin];

    .text-input {
      margin-right: #article()[operation-inp-interval];

      &:last-child {
        margin-right: 0;
      }
    }
  }

  .recommended-posts {
    > ul {
      list-style: none;
    }
  }

  :deep(> .loading) {
    position: fixed;
    left: 50%;
    top: 50%;
  }
}

</style>