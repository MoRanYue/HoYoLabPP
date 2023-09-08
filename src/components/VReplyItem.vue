<script setup lang="ts">
import { onMounted, ref, type Ref, watch } from 'vue';
import { useAsyncState, watchOnce, toValue } from '@vueuse/core';
import { useMotion } from '@vueuse/motion';
import { processStructContent } from '@/utils/articleStructContentProcessor';
import { formatTime } from '@/utils/utils'
import { upvoteReply, downvoteReply } from '@/api/interfaces';
import VIcon from './VIcon.vue'
import VUserAnchor from './VUserAnchor.vue';
import VButton from './VButton.vue';
import { useUserStore } from '@/stores/user'
import type { UserAnchorInfo } from '@/constants/IUserAnchorInfo';
import type { Dict } from '@/constants/TDict';
import type { NumberId } from '@/constants/Api';

const props = withDefaults(defineProps<{
  sender: UserAnchorInfo
  replyToUser?: UserAnchorInfo
  stats: Partial<{
    like: number
    subReply?: number
    dislike: number
  }>
  status: {
    disliked: boolean
    liked: boolean
  }
  postId: NumberId
  replyId: NumberId
  floor?: number
  time: {
    creating: number
    updating: number
  }
  subReply?: Dict[]
  content: string
}>(), {
})
const emits = defineEmits(['seeSubReply'])

const user = useUserStore()

let content = ref('处理中')
let status: Ref<{
  disliked: boolean
  liked: boolean
}> = ref({
  disliked: false,
  liked: false
})
async function refreshInfo() {
  content.value = await processStructContent(props.content)
  status.value = {...props.status}
}

watch(props, refreshInfo)
onMounted(refreshInfo)

async function vote(downvote: boolean = false) {
  if (downvote) {
    const voteInfo = await downvoteReply(props.postId, props.replyId, toValue(status).disliked, user.stoken.v2, user.accountId, user.mihoyoId)
    if (voteInfo.retcode != 0) {
      return
    }

    if (toValue(status).liked) {
      status.value.liked = false
    }
    status.value.disliked = !toValue(status).disliked
  }
  else {
    const voteInfo = await upvoteReply(props.postId, props.replyId, toValue(status).liked, user.stoken.v2, user.accountId, user.mihoyoId)
    if (voteInfo.retcode != 0) {
      return
    }

    if (toValue(status).disliked) {
      status.value.disliked = false
    }
    status.value.liked = !toValue(status).liked
  }
}

</script>

<template>
  <section class="reply-item">
    <div class="header" :title="props.replyId.toString()">
      <v-user-anchor :avatar-border="false" :avatar="props.sender.avatar" :user-id="props.sender.userId" :nickname="props.sender.nickname"></v-user-anchor>

      <div class="reply-to-user" v-if="props.replyToUser">
        <span>回复</span>
        <v-user-anchor :avatar="props.replyToUser.avatar" :nickname="props.replyToUser.nickname" :user-id="props.replyToUser.userId" :avatar-border="false"></v-user-anchor>
      </div>

      <div class="stat">
        <v-icon type="tower" size="20" theme="outline" title="楼层" :stroke-width="2" v-if="props.floor" content>{{ props.floor }}</v-icon>
        <v-icon type="upload" size="20" theme="outline" title="创建时间" :stroke-width="2" v-if="props.time.creating" content>{{ formatTime(new Date(props.time.creating * 1000)) }}</v-icon>
        <v-icon type="update-rotation" size="20" theme="outline" title="更新时间" :stroke-width="2" v-if="props.time.updating" content>{{ formatTime(new Date(props.time.updating * 1000)) }}</v-icon>
      </div>
    </div>

    <hr>

    <div class="content" v-html="content">
    </div>

    <div class="footer">
      <div class="sub-reply">
        <ul>
          <li v-for="reply in props.subReply" :key="reply.reply.reply_id">
            <v-reply-item
            :time="{creating: reply.reply.created_at, updating: reply.reply.updated_at}" 
            :sender="{nickname: reply.user.nickname, userId: reply.user.uid, avatar: reply.user.avatar_url}" 
            :content="reply.reply.struct_content" :reply-id="reply.reply.reply_id" :post-id="props.postId" 
            :stats="{like: reply.stat.like_num, dislike: reply.stat.dislike_num, subReply: reply.stat.sub_num}"
            :status="{liked: reply.self_operation.reply_vote_attitude == 1, disliked: reply.self_operation.reply_vote_attitude == 2}"
            :reply-to-user="(reply.r_user && reply.r_user.uid != props.sender.userId) ? {nickname: reply.r_user.nickname, avatar: reply.r_user.avatar_url, userId: reply.r_user.uid} : undefined"></v-reply-item>
          </li>
        </ul>

        <v-button class="see-all-sub-reply" type="secondary" v-if="Array.isArray(props.subReply) && Number(props.stats.subReply) > 3" 
        @click="$emit('seeSubReply', props.floor, props.replyId)">查看所有回复 共{{ props.stats.subReply }}个</v-button>
      </div>

      <div class="stat">
        <div class="info">
          <v-icon type="like" size="20" theme="outline" title="点赞" :stroke-width="2" v-if="props.stats.like" content>{{ props.stats.like }}</v-icon>
          <v-icon type="dislike" size="20" theme="outline" title="点踩" :stroke-width="2" v-if="props.stats.dislike" content>{{ props.stats.dislike }}</v-icon>
        </div>

        <div class="operation">
          <v-button class="like" @click="vote(false)" title="点赞" icon="like" type="icon" :icon-theme="status.liked ? 'filled' : 'outline'" :icon-width="3"></v-button>
          <v-button class="dislike" @click="vote(true)" title="点踩" icon="dislike-two" type="icon" :icon-theme="status.disliked ? 'two-tone' : 'outline'" :icon-width="3"></v-button>

          <v-button class="post-reply" title="回复" type="icon" icon-theme="outline" icon="comment"></v-button>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="less" scoped>
@import '@/assets/base.less';
@import '@/assets/structContent.less';

#reply-item() {
  radius: #border-radius()[large];
  padding: 0.5em 0.75em;
  header-padding: 0.2em 0.3em;
  header-interval: 0.4em;
  stat-interval: 0.4em;
  footer-interval: 0.7em;
  operation-padding: 0.2em;
  operation-btn-interval: 0.3em;
  sub-reply-interval: 0.5em;
}
#dark-reply-item() {
  bg-color: lighten(#dark()[primary], 15%);
  sub-reply-bg-color: lighten(#dark()[primary], 8%);
}

.reply-item {
  background-color: #dark-reply-item()[bg-color];
  display: flex;
  flex-direction: column;
  flex-wrap: none;
  padding: #reply-item()[padding];
  border-radius: #reply-item()[radius];

  .header {
    display: flex;
    flex-direction: row;
    flex-wrap: nowrap;
    align-items: center;
    justify-content: space-between;
    padding: #reply-item()[header-padding];
    margin-bottom: #reply-item()[header-interval];

    .reply-to-user {
      display: flex;
      flex-direction: column;
      align-items: center;
      flex-wrap: nowrap;
    }

    .stat {
      display: flex;
      flex-direction: row;

      .icon-container {
        margin-right: #reply-item()[stat-interval];

        &:last-child {
          margin-right: 0;
        }
      }
    }
  }

  .content {
    flex-grow: 1;
  }
  
  .footer {
    margin-top: #reply-item()[footer-interval];

    .stat {
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      flex-wrap: nowrap;

      .info {
        display: flex;
        flex-direction: row;
        flex-wrap: nowrap;

        .icon-container {
          margin-right: #reply-item()[stat-interval];

          &:last-child {
            margin-right: 0;
          }
        }
      }

      .operation {
        padding: #reply-item()[operation-padding];

        .button {
          margin-right: #reply-item()[operation-btn-interval];

          &:last-child {
            margin-right: 0;
          }
        }
      }
    }

    .sub-reply {
      display: flex;
      flex-direction: column;
      flex-wrap: nowrap;

      > ul {
        flex-grow: 1;
        list-style: none;

        > li {
          margin-bottom: #reply-item()[sub-reply-interval];

          // &:last-child {
          //   margin-bottom: 0;
          // }

          > .reply-item {
            background-color: #dark-reply-item()[sub-reply-bg-color];
          }
        }
      }

      .see-all-sub-reply {
        width: 100%;
      }
    }
  }
}

</style>
