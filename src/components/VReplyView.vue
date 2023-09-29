<script setup lang="ts">
import VBackgroundBlocker from './VBackgroundBlocker.vue';
import VReplyItem from './VReplyItem.vue';
import VButton from './VButton.vue';
import VIcon from './VIcon.vue'
import { subReplyInfo } from '@/api/interfaces';
import type { Dict } from '@/constants/TDict';
import type { UserAnchorInfo } from '@/constants/IUserAnchorInfo';
import { toValue, useElementVisibility, useScroll } from '@vueuse/core';
import { useUserStore } from '@/stores/user'
import { onMounted, ref, watch, type Ref } from 'vue'

const props = withDefaults(defineProps<{
  sender: UserAnchorInfo
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
}>(), {

})
const emits = defineEmits(['close'])

let subReply: Ref<Dict[]> = ref([])
function prepareReplies() {
  subReply.value = props.subReply
}
// watch(props, prepareReplies)
onMounted(prepareReplies)

const user = useUserStore()

const replyEnd = ref<HTMLElement>()
const contentElement = ref<HTMLElement>()
const isTimeToRefresh = useElementVisibility(replyEnd)

watch(isTimeToRefresh, (needRefresh) => {
  if (needRefresh && toValue(subReply).length != 0) {
    appendReply()
  }
})

async function appendReply() {
  let lastReplyId: string | undefined = undefined
  if (toValue(subReply).length != 0) {
    const subReplyCount = toValue(subReply).length
    const lastReplyIdHeader = toValue(subReply)[subReplyCount - 1].reply.reply_id.slice(0, 11)
    lastReplyId = lastReplyIdHeader + String(parseInt(toValue(subReply)[subReplyCount - 1].reply.reply_id.slice(11)) + 1)
  }
  
  const subReplyData = (await subReplyInfo(props.postId, props.floor, 20, lastReplyId, 'web', user.chooseLtoken(), user.accountId, user.mihoyoId)).data.list
  subReplyData.forEach(reply => {
    toValue(subReply).push(reply)
  });
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
</script>

<template>
  <section class="reply-view">
    <div class="title">
      <div class="operation">
        <v-button class="close" title="关闭" icon="close" type="icon" :icon-width="3" @click="$emit('close')"></v-button>
        <v-button class="to-top" title="到达顶部" icon="up" type="icon" :icon-width="3" @click="toTop"></v-button>
      </div>
    </div>

    <div class="content" ref="contentElement">
      <v-reply-item :post-id="props.postId" :sender="props.sender" :stats="props.stats" :status="props.status" :reply-id="props.replyId" :time="props.time" :content="props.content"></v-reply-item>

      <hr>

      <ul>
        <li v-for="reply in subReply" :key="reply.reply.reply_id">
          <v-reply-item
            :time="{creating: reply.reply.created_at, updating: reply.reply.updated_at}" 
            :sender="{nickname: reply.user.nickname, userId: reply.user.uid, avatar: reply.user.avatar_url}" 
            :content="reply.reply.struct_content" :reply-id="reply.reply.reply_id" 
            :stats="{like: reply.stat.like_num, dislike: reply.stat.dislike_num}" :post-id="props.postId"
            :status="{liked: reply.self_operation.reply_vote_attitude == 1, disliked: reply.self_operation.reply_vote_attitude == 2}"
            :reply-to-user="(reply.r_user && reply.r_user.uid != props.sender.userId) ? {nickname: reply.r_user.nickname, avatar: reply.r_user.avatar_url, userId: reply.r_user.uid} : undefined"></v-reply-item>
        </li>
      </ul>

      <v-icon theme="filled" type="endless" content ref="replyEnd">数据有尽头，语言没有尽头</v-icon>
    </div>
  </section>

  <v-background-blocker layer="4"></v-background-blocker>
</template>

<style scoped lang="less">
@import '@/assets/base.less';

#reply-view() {
  radius: #border-radius()[small] #border-radius()[large-xx];
  padding: 0.8em 1.2em 0.3em 1.2em;
  shadow: 5px 5px 5px 2px #dark-reply-view()[shadow-color];
  content-padding: 0 0.5em 0 0;
  title-interval: 0.7em;
  reply-interval: 0.5em;
}
#dark-reply-view() {
  bg-color: lighten(#dark()[secondary], 10%);
  shadow-color: darken(#dark()[secondary], 3%);
  sub-reply-bg-color: lighten(#dark()[secondary], 5%);
}

.reply-view {
  box-shadow: #reply-view()[shadow];
  padding: #reply-view()[padding];
  border-radius: #reply-view()[radius];
  position: fixed;
  z-index: 5;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 45%;
  height: 85%;
  background-color: #dark-reply-view()[bg-color];
  overflow: hidden;
  display: flex;
  flex-direction: column;
  flex-wrap: nowrap;

  .title {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    margin-bottom: #reply-view()[title-interval];

    .operation {
      flex-grow: 1;
      display: flex;
      flex-direction: row;
      flex-wrap: nowrap;
      justify-content: space-between;
    }
  }

  .content {
    padding: #reply-view()[content-padding];
    flex-grow: 1;
    overflow: hidden auto;

    .reply-item {
      margin-bottom: #reply-view()[reply-interval];
    }

    > ul {
      list-style: none;

      > li {
        .reply-item {
          background-color: #dark-reply-view()[sub-reply-bg-color];
        }
      }
    }
  }
}

</style>