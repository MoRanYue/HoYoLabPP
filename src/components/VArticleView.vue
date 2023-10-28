<script setup lang="ts">
import { ref, watch, getCurrentInstance, type Ref } from 'vue';
import { useAsyncState, useScroll, useElementVisibility, toValue, type MaybeRef, watchOnce } from '@vueuse/core'
import { processStructContent } from '@/utils/articleStructContentProcessor';
import { type ReplyOrderType, postReplyInfo, subReplyInfo, replyInfo, upvotePost, collectPost } from '@/api/interfaces'
import { useUserStore } from '@/stores/user';
import VIcon from './VIcon.vue';
import VButton from './VButton.vue';
import VUserAnchor from './VUserAnchor.vue';
import VReplyItem from './VReplyItem.vue';
import VSwitch from './VSwitch.vue'
import VBackgroundBlocker from './VBackgroundBlocker.vue';
import VReplyView from './VReplyView.vue';
import { formatTime } from '@/utils/utils'
import type { Dict } from '@/constants/TDict';
import { HoyolabApiReturnCode, type NumberId } from '@/constants/Api';
import type { UserAnchorInfo } from '@/constants/IUserAnchorInfo';
import type { StructContent } from '@/constants/IStructContent';

const props = withDefaults(defineProps<{
  title: string,
  content: string
  postId: NumberId
  poster: UserAnchorInfo
  postViewType: number
  postImages?: string[]
  status: {
    liked: boolean
    collected: boolean
  }
  time: {
    creating: number
    updating: number
  }
  stats: Partial<{
    like: number
    reply: number
    view: number
    bookmark: number
    forward: number
  }>
  isLoading?: MaybeRef<boolean>
  isReady?: MaybeRef<boolean>
}>(), {
  postImages: []
})
const emits = defineEmits(['close'])
const inst = getCurrentInstance()

const user = useUserStore()

const article = ref<HTMLElement>()
const contentElement = ref<HTMLElement>()
const articleContent = ref<HTMLElement>()
const replyTitle = ref<HTMLElement>()
const replyEnd = ref<HTMLElement>()

let content = ref('')
let status: Ref<{
  liked: boolean
  collected: boolean
}> = ref({
  liked: false,
  collected: false
})
const replies = ref({
  pinnedReplyId: 0,
  replies: []
})
let replyOrderType: keyof typeof ReplyOrderType = 'heat'
let isTimeToRefresh = useElementVisibility(replyEnd, {})
const currentReply: Ref<{
  isBrowsing: boolean
  sender: {
    nickname: string
    avatar?: string
    userId?: string | number
  },
  stats: Partial<{
    like: number
    dislike: number
  }>
  status: {
    disliked: boolean
    liked: boolean
  }
  replyId: number | string
  postId: number | string
  floor: number
  time: {
    creating: number
    updating: number
  }
  subReply: Dict[]
  content: string
}> = ref({
  isBrowsing: false,
  sender: {
    nickname: '',
    avatar: undefined,
    userId: undefined
  },
  stats: {
    like: 0,
    dislike: 0
  },
  status: {
    liked: false,
    disliked: false
  },
  replyId: '0',
  postId: '0',
  floor: 0,
  time: {
    creating: 0,
    updating: 0
  },
  subReply: [],
  content: '[{"insert":"未定义"}]',
})

watch(props, async () => {
  if (typeof props.content == 'undefined') {
    return
  }
  
  toTop()

  let contentSource: StructContent[] = []
  if (props.postViewType == 2) {
    const contentTemp: {
      describe: string
      imgs: string[]
    } = JSON.parse(props.content)

    contentSource.push({insert: contentTemp.describe})
    contentTemp.imgs.forEach(imgUrl => {
      contentSource.push({insert: {image: imgUrl}})
    });
  }
  else {
    contentSource = JSON.parse(props.content || '[]')
  }

  content.value = await processStructContent(contentSource)
  status.value = {...props.status}
  replies.value = {
    pinnedReplyId: 0,
    replies: []
  }
  await refreshReply(replyOrderType)
})

watch(isTimeToRefresh, (needRefresh) => {
  if (needRefresh && toValue(replies).replies.length != 0) {
    refreshReply(replyOrderType, true)
  }
})

async function refreshReply(orderType: keyof typeof ReplyOrderType = 'heat', append: boolean = false) {
  if (props.postId == '0') {
    return
  }

  const oldReplyData = toValue(replies).replies
  let lastReplyId = undefined
  if (oldReplyData.length != 0 && append) {
    lastReplyId = oldReplyData.length
  }
  const replyInfo = await postReplyInfo(props.postId, orderType, 20, lastReplyId, 'web', user.chooseLtoken(), user.accountId, user.mihoyoId)

  if (replyInfo.retcode != 0) {
    return
  }

  if (append && lastReplyId) {
    replyInfo.data.list.forEach(reply => {
      replies.value.replies.push(reply)
    });

    return
  }

  replies.value = {
    replies: replyInfo.data.list,
    pinnedReplyId: replyInfo.data.pin_reply_id
  }
}

const { y: contentScrollY } = useScroll(contentElement)
function toTop() {
  let lastY: number = 0
  const timer = setInterval(() => {
    if (contentScrollY.value > lastY && lastY > 0) {
      clearInterval(timer)
    }

    const step = Math.ceil(contentScrollY.value / 10)
    contentScrollY.value -= step
    lastY = contentScrollY.value

    if (contentScrollY.value <= 0) {
      contentScrollY.value = 0
      clearInterval(timer)
    }
  }, 30)
}
function toReplyTitle() {
  replyTitle.value?.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  })
}

function changeReplyOrder(value: keyof typeof ReplyOrderType) {
  replyOrderType = value
  refreshReply(value)
}

async function viewReply(floor: number, parentReplyId: number | string) {
  const parentReply = await replyInfo(props.postId, parentReplyId, 'web', user.chooseLtoken(), user.accountId, user.mihoyoId)
  const subReply = await subReplyInfo(props.postId, floor, 20, undefined, 'web', user.chooseLtoken(), user.accountId, user.mihoyoId)
  if (parentReply.retcode != HoyolabApiReturnCode.success || subReply.retcode != HoyolabApiReturnCode.success) {
    return
  }

  currentReply.value.subReply = subReply.data.list

  const reply = parentReply.data.reply
  currentReply.value.content = reply.reply.struct_content
  currentReply.value.replyId = reply.reply.reply_id
  currentReply.value.floor = reply.reply.floor_id
  currentReply.value.postId = reply.reply.post_id
  currentReply.value.sender = {
    nickname: reply.user.nickname,
    avatar: reply.user.avatar_url,
    userId: reply.user.uid
  }
  currentReply.value.stats = {
    dislike: reply.stat.dislike_num,
    like: reply.stat.like_num
  }
  currentReply.value.status = {
    liked: reply.self_operation.reply_vote_attitude == 1, 
    disliked: reply.self_operation.reply_vote_attitude == 2
  }
  currentReply.value.time = {
    creating: reply.reply.created_at,
    updating: reply.reply.updated_at
  }

  currentReply.value.isBrowsing = true
}

function closeView() {
  if (articleContent.value) {
    for (let i = 0; i < articleContent.value.children.length; i++) {
      const child = articleContent.value.children[i];
      
      if (child.classList.contains('hoyolab-video')) {
        (<HTMLVideoElement>child.firstChild!!).pause()
      }
    }
  }

  emits('close')
}

async function upvote() {
  const upvoteInfo = await upvotePost(props.postId, toValue(status).liked, 'application', user.chooseStoken(), user.accountId, user.mihoyoId)
  if (upvoteInfo.retcode != 0) {
    return
  }

  status.value.liked = !toValue(status).liked
}
async function collect() {
  const collectInfo = await collectPost(props.postId, toValue(status).collected, 'application', user.chooseStoken(), user.accountId, user.mihoyoId)
  if (collectInfo.retcode != 0) {
    return
  }

  status.value.collected = !toValue(status).collected
}

</script>

<template>
  <section v-if="currentReply.isBrowsing">
    <v-reply-view :time="currentReply.time" :stats="currentReply.stats" :status="currentReply.status"
    :content="currentReply.content" :sender="currentReply.sender" :reply-id="currentReply.replyId" :sub-reply="currentReply.subReply" 
    :post-id="currentReply.postId" :floor="currentReply.floor" 
    @close="currentReply.isBrowsing = false"></v-reply-view>
  </section>

  <section class="article-view" ref="article">
    <div class="operation">
      <v-button class="close" title="关闭" icon="close" type="icon" :icon-width="3" @click="closeView"></v-button>
      <div class="article-operation" v-if="user.loggedIn">
        <v-button class="like" @click="upvote" title="点赞" icon="like" type="icon" :icon-theme="status.liked ? 'filled' : 'outline'" :icon-width="3"></v-button>
        <v-button class="collect" @click="collect" title="收藏" icon="bookmark" type="icon" :icon-theme="status.collected ? 'filled' : 'outline'" :icon-width="3"></v-button>
        <v-button class="forward" title="转发（仅用于完成米游币任务）" icon="share-two" type="icon" :icon-width="3"></v-button>
      </div>
      <div class="page-operation">
        <v-button class="to-top" title="到达顶部" icon="up" type="icon" :icon-width="3" @click="toTop"></v-button>
        <v-button class="to-reply" title="到达评论" icon="comments" type="icon" :icon-width="3" @click="toReplyTitle"></v-button>
      </div>
    </div>

    <div class="title">
      <h1>{{ props.title }}</h1>
      <span class="post-id">{{ props.postId }}</span>
      <div class="stat">
        <div class="dynamic-data">
          <v-icon type="like" title="点赞" size="20" theme="outline" :stroke-width="2" v-if="props.stats.like" content>{{ props.stats.like }}</v-icon>
          <v-icon type="grinning-face-with-tightly-closed-eyes" title="浏览" size="20" theme="outline" :stroke-width="2" v-if="props.stats.view" content>{{ props.stats.view }}</v-icon>
          <v-icon type="comment" size="20" theme="outline" title="评论" :stroke-width="2" v-if="props.stats.reply" content>{{ props.stats.reply }}</v-icon>
          <v-icon type="bookmark" size="20" theme="outline" title="收藏" :stroke-width="2" v-if="props.stats.bookmark" content>{{ props.stats.bookmark }}</v-icon>
          <v-icon type="share-two" size="20" theme="outline" title="转发" :stroke-width="2" v-if="props.stats.forward" content>{{ props.stats.forward }}</v-icon>
        </div>

        <div class="time">
          <v-icon type="upload" title="创建时间" size="20" theme="outline" :stroke-width="2" v-if="props.time.creating" content>{{ formatTime(new Date(props.time.creating * 1000)) }}</v-icon>
          <v-icon type="update-rotation" title="更新时间" size="20" theme="outline" :stroke-width="2" v-if="props.time.updating" content>{{ formatTime(new Date(props.time.updating * 1000)) }}</v-icon>
        </div>
      </div>
      
      <v-user-anchor :nickname="props.poster.nickname" :avatar="props.poster.avatar" :user-id="props.poster.userId"></v-user-anchor>
    </div>

    <hr>

    <div class="post-content" ref="contentElement">
      <article class="content" v-html="content" ref="articleContent">
      </article>

      <hr>

      <div class="reply-title" ref="replyTitle">
        <h3>评论：</h3>
        <v-switch :choices="[
          {text: '按热度', value: 'heat', default: true}, 
          {text: '发布时间（升序）', value: 'oldest'}, 
          {text: '发布时间（倒序）', value: 'newest'},
          {text: '仅发布者', value: 'poster'}
        ]" @choose="changeReplyOrder"></v-switch>
      </div>

      <div class="reply" ref="replyList">
        <ul>
          <li v-for="reply in replies.replies" :key="reply.reply.reply_id">
            <v-reply-item 
            :time="{creating: reply.reply.created_at, updating: reply.reply.updated_at}" :floor="reply.reply.floor_id" 
            :post-id="reply.reply.post_id" 
            :sender="{nickname: reply.user.nickname, userId: reply.user.uid, avatar: reply.user.avatar_url}" 
            :content="reply.reply.struct_content" :reply-id="reply.reply.reply_id" :sub-reply="reply.sub_replies" 
            :stats="{like: reply.stat.like_num, dislike: reply.stat.dislike_num, subReply: reply.stat.sub_num}" 
            :status="{liked: reply.self_operation.reply_vote_attitude == 1, disliked: reply.self_operation.reply_vote_attitude == 2}" 
            @see-sub-reply="viewReply"></v-reply-item>
          </li>
        </ul>

        <v-icon theme="filled" type="endless" content ref="replyEnd">数据有尽头，语言没有尽头</v-icon>
      </div>
    </div>
  </section>
  
  <v-background-blocker layer="1"></v-background-blocker>
</template>

<style lang="less" scoped>
@import '@/assets/base.less';
@import '@/assets/structContent.less';
// @import url("https://fonts.googleapis.com/css2?family=Noto+Serif:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,300;1,400;1,600;1,700;1,800;1,900&display=swap");

#article-view() {
  radius: #border-radius()[large-xxx] #border-radius()[small];
  shadow: 10px 8px 10px 2px #dark-article-view()[shadow-color];
  title-shadow: 6px 4px 3px #dark-article-view()[title-shadow-color];
  padding: 1em 1.4em 0.5em 1.4em;
  title-size: 2rem;
  title-interval: 0.7em;
  title-text-interval: 0.5em;
  post-id-size: 0.7rem;
  poster-margin: 0.7em 0;
  stat-interval: 0.4em;
  content-line-height: 1.6rem;
  content-font-size: 1.06rem;
  content-margin: 0.6em 0;
  content-padding: 0.4em 0.6em;
  post-content-padding: 0 0.5em 0 0;
  operation-padding: 0.3em 0.4em;
  operation-interval: 0.5em;
  operation-radius: #border-radius()[medium];
  reply-title-interval: 0.8em;
  reply-item-interval: 0.6em;
}
#dark-article-view() {
  bg-color: lighten(#dark()[primary], 8%);
  shadow-color: darken(#dark()[secondary], 3%);
  title-shadow-color: darken(#dark()[secondary], 4%);
  operation-bg-color: lighten(#dark()[primary], 12%);
}

.article-view {
  padding: #article-view()[padding];
  border-radius: #article-view()[radius];
  z-index: 3;
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 50%;
  height: 90%;
  background-color: #dark-article-view()[bg-color];
  box-shadow: #article-view()[shadow];
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;

  .operation {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: space-between;

    > div {
      background-color: #dark-article-view()[operation-bg-color];
      padding: #article-view()[operation-padding];
      border-radius: #article-view()[operation-radius];

      .button {
        margin-left: #article-view()[operation-interval];

        &:first-child {
          margin-left: 0;
        }
      }
    }
  }

  .title {
    display: flex;
    flex-direction: column;
    margin-bottom: #article-view()[title-interval];

    > hr {
      display: block;
    }

    .post-id {
      text-align: center;
      font-size: #article-view()[post-id-size];
      margin-bottom: #article-view()[title-text-interval];
    }

    h1 {
      align-self: center;
      width: fit-content;
      text-align: center;
      font-size: #article-view()[title-size];
      text-shadow: #article-view()[title-shadow];
      font-family: 'LXGW WenKai', sans-serif;
      font-weight: 900;
      // margin-bottom: #article-view()[title-text-interval];
    }

    .user-anchor {
      margin: #article-view()[poster-margin];
      align-self: center;
    }

    .stat {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;

      .dynamic-data, 
      .time {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;
        justify-content: center;
      }

      .icon-container {
        margin-left: #article-view()[stat-interval];
      }
    }
  }

  .post-content {
    padding: #article-view()[post-content-padding];
    height: 100%;
    overflow: hidden auto;

    > .content {
      margin: #article-view()[content-margin];
      padding: #article-view()[content-padding];
      font-size: #article-view()[content-font-size];
      line-height: #article-view()[content-line-height];
    }

    .reply-title {
      width: 100%;
      display: flex;
      flex-wrap: nowrap;
      align-items: center;
      justify-content: space-between;
      margin-bottom: #article-view()[reply-title-interval];
    }

    > .reply {
      > ul {
        list-style: none;
        // display: flex;
        // flex-wrap: wrap;

        > li {
          margin-bottom: #article-view()[reply-item-interval];

          &:last-child {
            margin-bottom: 0;
          }
        }
      }
    }
  }
}

</style>
