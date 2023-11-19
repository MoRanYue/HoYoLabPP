<script setup lang="ts">
import { toRef, useElementVisibility, toValue } from '@vueuse/core';
import { articleInfo, homeInfo, dynamicData, forumArticle, ForumArticleOrderType } from '@/api/interfaces'
import { ref, watch, type Ref, onMounted, type CSSProperties } from "vue";
import { useRoute } from 'vue-router';
import VArticleView from '@/components/VArticleView.vue';
import VArticleItem from '@/components/VArticleItem.vue';
import VIcon from '@/components/VIcon.vue';
import VTextInput from '@/components/VTextInput.vue'
import VVerificationView from '@/components/VVerificationView.vue';
import VSwitch from '@/components/VSwitch.vue';
import { useUserStore } from '@/stores/user'
import type { Dict } from '@/constants/TDict';
import { HoyolabApiReturnCode, HoyolabParentForum, type NumberId } from '@/constants/Api';
import type { UserAnchorInfo } from '@/constants/IUserAnchorInfo';
import { getForums, type ChildForum } from '@/api/resources';
import type { SwitchInfo } from '@/constants/TSwitchInfo';
import { notify } from '@/utils/notification';

const user = useUserStore()

const route = useRoute()

const page = ref<number>(1)
const lastForumArticleId = ref<NumberId>()
let currentForumGameId: NumberId = 2
let currentForumCategory: ChildForum[] | undefined = undefined
let currentChildForumCategory: ChildForum | undefined = undefined

const articleEnd = ref<HTMLElement>()
const isTimeToRefresh = useElementVisibility(articleEnd)

const needValidate = ref(false)
const isForumArticle = ref(false)
const articleOrderType: Ref<keyof typeof ForumArticleOrderType> = ref('heat')

const recommendedPosts = ref([])
async function refreshArticle(append: boolean = false) {
  if (append) {
    page.value++
  }
  else {
    recommendedPosts.value = []
    page.value = 1
    lastForumArticleId.value = undefined
  }
  
  if (toValue(isForumArticle)) {
    if (!currentChildForumCategory) {
      notify('未加载完成', '文章', 'error')
      return
    }

    const res = await forumArticle(currentChildForumCategory.id, currentForumGameId, toValue(articleOrderType), toValue(lastForumArticleId), 20, 'web')
    if (res.retcode != HoyolabApiReturnCode.success) {
      return
    }

    lastForumArticleId.value = res.data.last_id

    res.data.list.forEach(article => {
      recommendedPosts.value.push(article)
    });
  }
  else {
    const res = await homeInfo(currentForumGameId, toValue(page), 20)
    if (res.retcode != HoyolabApiReturnCode.success) {
      return
    }

    res.data.recommended_posts.forEach(article => {
      recommendedPosts.value.push(article)
    });
  }
}
watch(isTimeToRefresh, (needRefresh) => {
  if (needRefresh && recommendedPosts.value.length != 0) {
    refreshArticle(true)
  }
})
watch(articleOrderType, () => {
  refreshArticle()
})
watch(recommendedPosts, async (posts) => {
  if (posts.length == 0) {
    return
  }

  const postIds: number[] = []
  posts.forEach(post => {
    postIds.push(post.post.post_id)
  });

  const articleDynamicInfo = await dynamicData(postIds)
  if (articleDynamicInfo.retcode != HoyolabApiReturnCode.success) {
    return
  }

  if (articleDynamicInfo.data.list.length == recommendedPosts.value.length) {
    articleDynamicInfo.data.list.forEach((info, i) => {
      recommendedPosts.value[i].stat = info.stat
    });
  }
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
  const postInfo = await articleInfo(postId, 'application', user.stoken.v2, user.accountId, user.mihoyoId)

  if (postInfo.retcode != HoyolabApiReturnCode.success) {
    if (postInfo.retcode == HoyolabApiReturnCode.needVerification) {
      needValidate.value = true
    }

    return
  }
  currentArticle.value.isBrowsing = true

  const post = postInfo.data.post
  currentArticle.value.title = post.post.subject
  currentArticle.value.content = post.post.view_type == 2 ? post.post.content : post.post.structured_content
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
}

if (route.params.postId) {
  viewPost(<string>route.params.postId)
}

const forumContainerStyle: Ref<CSSProperties> = ref({
  backgroundImage: 'none'
})
const parentForumChoices: Ref<SwitchInfo> = ref([
  {text: '崩坏3', value: '1'},
  {text: '原神', value: '2', default: true},
  {text: '崩坏学园2', value: '3'},
  {text: '未定事件簿', value: '4'},
  {text: '综合', value: '5'},
  {text: '崩坏：星穹铁道', value: '6'},
  {text: '绝区零', value: '8'}
])
const childForumChoices: Ref<SwitchInfo> = ref([

])
async function switchForumCategory(gameId: NumberId) {
  currentForumGameId = gameId
  childForumChoices.value = [{text: '首页', value: 'home', default: true}]

  const forums = getForums()
  if (!forums) {
    console.warn('未获取到论坛分区信息，子分区只有首页信息')
    return await switchChildForumCategory('home')
  }

  const parentForum = forums[gameId];
  currentForumCategory = parentForum

  parentForum.forEach((childForum, i) => {
    childForumChoices.value.push({
      text: childForum.name,
      value: childForum.id.toString()
    })
  });

  await switchChildForumCategory('home')
}
async function switchChildForumCategory(forumId: NumberId) {
  if (forumId == 'home') {
    isForumArticle.value = false
  }
  else {
    if (!currentForumCategory) {
      return
    }

    isForumArticle.value = true

    for (let i = 0; i < currentForumCategory.length; i++) {
      const childForum = currentForumCategory[i];
      
      if (forumId == childForum.id) {
        currentChildForumCategory = childForum
        break
      }
    }

    if (!currentChildForumCategory) {
      notify('论坛分区不存在', '文章', 'error')
      return
    }
    
    if (currentChildForumCategory.headerPicture) {
      forumContainerStyle.value.backgroundImage = `url(${currentChildForumCategory.headerPicture})`
    }
    else {
      forumContainerStyle.value.backgroundImage = ``
    }
  }

  await refreshArticle()
}
async function switchForumArticleOrderType(orderType: keyof typeof ForumArticleOrderType) {
  articleOrderType.value = orderType
}

onMounted(() => {
  setTimeout(() => switchForumCategory(2), 500)
})

</script>

<template>
  <section v-show="currentArticle.isBrowsing">
    <v-article-view :post-id="currentArticle.postId" :time="currentArticle.time" :poster="currentArticle.poster" 
    :status="currentArticle.status" :content="currentArticle.content" :title="currentArticle.title" 
    :stats="currentArticle.stats" :post-view-type="currentArticle.postViewType" @close="currentArticle.isBrowsing = false"
    :is-loading="currentArticle.isLoading" :is-ready="currentArticle.isReady" :post-images="currentArticle.postImages"></v-article-view>
  </section>
  <section v-show="needValidate">
    <v-verification-view @finish="needValidate = false"></v-verification-view>
  </section>

  <div class="article">
    <div class="forum" :style="forumContainerStyle">
      <v-switch :choices="parentForumChoices" @choose="switchForumCategory"></v-switch>
      <v-switch :choices="childForumChoices" @choose="switchChildForumCategory"></v-switch>
      <v-switch :choices="[{text: '按热度', value: 'heat', default: true}, {text: '发布时间（升序）', value: 'newest'}, {text: '评论发布时间（升序）', value: 'newestReply'}, {text: '仅精华', value: 'essence'}]"
      @choose="switchForumArticleOrderType" v-if="isForumArticle"></v-switch>
    </div>

    <div class="search">
      <v-text-input icon="search" title="搜索文章" placeholder="搜索文章"></v-text-input>
      <v-text-input icon="target" title="文章ID" placeholder="请输入文章ID" @finish="viewPost"></v-text-input>
    </div>

    <!-- <v-need-to-load :is-loading="homeIsLoading" :is-ready="homeIsReady"> -->
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
    <!-- </v-need-to-load> -->
  </div>
</template>

<style scoped lang="less">
@import "@/assets/base.less";

#article() {
  operation-margin: 1em 0 0 0;
  operation-inp-interval: 0.5em;
  forum-radius: #border-radius()[large-xx];
  forum-margin: 1.1em 0 0 0;
  forum-padding: 1.8em;
  forum-switch-interval: 1.3em;
}
#dark-article() {
  forum-default-bg-color: lighten(#dark()[secondary], 15%);
}

.article {
  display: flex;
  align-items: center;
  flex-direction: column;
  margin: auto;
  width: 60%;

  .forum {
    margin: #article()[forum-margin];
    padding: #article()[forum-padding];
    background-color: #dark-article()[forum-default-bg-color];
    background-repeat: no-repeat;
    background-size: cover;
    display: flex;
    flex-direction: column;
    align-items: center;
    border-radius: #article()[forum-radius];

    > .switch {
      margin-top: #article()[forum-switch-interval];

      &:first-child {
        margin-top: 0;
      }
    }
  }

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

      > li {
        width: 100%;
      }
    }
  }

  :deep(> .loading) {
    position: fixed;
    left: 50%;
    top: 50%;
  }
}

</style>