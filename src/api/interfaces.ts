import type { Dict } from "@/constants/TDict";
import { requestMihoyo } from "./dynamicSignProcessor";
import jsEncrypt from 'jsencrypt'
import type { NumberId } from "@/constants/Api";

export enum ReplyOrderType {
  heat,
  newest,
  oldest
}

export async function articleInfo(id: NumberId) {
  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/post/api/getPostFull', undefined, undefined, undefined, {
    post_id: id
  }, undefined, {})
}
export async function homeInfo(gameId: number, page?: number = 1, pageCount?: number = 20) {
  return await requestMihoyo('get', 'https://bbs-api-static.miyoushe.com/apihub/wapi/webHome', undefined, undefined, undefined, {
    gids: gameId,
    page,
    page_size: pageCount
  }, undefined, {})
}
export async function dynamicData(postIds: NumberId[]) {
  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/post/wapi/getDynamicData', undefined, undefined, undefined, {
    post_ids: postIds.join(','),
  })
}
export async function postReplyInfo(postId: NumberId, orderType: keyof typeof ReplyOrderType, count: number = 20, lastReplyCount?: number) {
  const params: Dict = {
    post_id: postId,
    size: count,
  }
  if (orderType == 'newest') {
    params.order_type = 2
  }
  else if (orderType == 'oldest') {
    params.order_type = 1
  }
  else if (orderType == 'heat') {
    params.is_hot = 'true'
  }

  if (lastReplyCount) {
    params.last_id = lastReplyCount
  }

  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/post/wapi/getPostReplies', undefined, undefined, undefined, params)
}
export async function emotionList() {
  return await requestMihoyo('get', 'https://bbs-api-static.miyoushe.com/misc/api/emoticon_set')
}
export async function replyInfo(postId: NumberId, replyId: NumberId) {
  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/post/wapi/getRootReplyInfo', undefined, undefined, undefined, {
    post_id: postId,
    reply_id: replyId
  })
}
export async function subReplyInfo(postId: NumberId, floor: number, count: number = 20, lastReplyId?: NumberId) {
  const params: Dict = {
    post_id: postId,
    floor_id: floor,
    size: count
  }
  if (lastReplyId) {
    params.last_id = lastReplyId
  }

  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/post/wapi/getSubReplies', undefined, undefined, undefined, params)
}
export async function userInfo(userId: NumberId) {
  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/user/api/getUserFullInfo', undefined, undefined, undefined, {
    uid: userId,
    gids: 2
  })
}

export async function loginMihoyoByPasswordCreateMmt(account: string) {
  const time = Math.floor(Date.now() / 1000)

  return await requestMihoyo('get', 'https://webapi.account.mihoyo.com/Api/create_mmt', undefined, undefined, undefined, {
    scene_type: 1,
    now: time,
    t: time,
    account,
    reason: 'user.mihoyo.com%2523%252Flogin%252Fpassword',
    action_type: 'login_by_password'
  }, undefined, {
    Referer: 'https://user.mihoyo.com/',
  })
}
export async function loginMihoyoByPassword(mmtKey: string, account: string, password: string) {
  const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDvekdPMHN3AYhm/vktJT+YJr7
cI5DcsNKqdsx5DZX0gDuWFuIjzdwButrIYPNmRJ1G8ybDIF7oDW2eEpm5sMbL9zs
9ExXCdvqrn51qELbqj0XxtMTIpaCHFSI50PfPpTFV9Xt/hmyVwokoOXFlAEgCn+Q
CgGs52bFoYMtyi+xEQIDAQAB
-----END PUBLIC KEY-----`

  const encrypt = new jsEncrypt()
  encrypt.setPublicKey(publicKey)
  const encPwd = encrypt.encrypt(password)

  return await requestMihoyo('post', 'https://webapi.account.mihoyo.com/Api/login_by_password', undefined, undefined, undefined, {
    mmt_key: mmtKey,
    account,
    password: encPwd,
    is_crypto: true,
    source: 'user.mihoyo.com',
    t: Math.floor(Date.now() / 1000)
  }, undefined, {
    Referer: 'https://user.mihoyo.com/',
  })
}

export async function getStokenAndLtokenByLoginTicket(loginTicket: string, accountId: NumberId) {
  return await requestMihoyo('get', 'https://api-takumi.mihoyo.com/auth/api/getMultiTokenByLoginTicket', undefined, undefined, undefined, {
    token_types: 3,
    login_ticket: loginTicket,
    uid: accountId
  })
}
export async function getCookieTokenByStoken(stoken: string, accountId: NumberId, mihoyoId: string) {
  return await requestMihoyo('get', 'https://api-takumi.mihoyo.com/auth/api/getCookieAccountInfoBySToken', undefined, undefined, undefined, {
    stoken,
    uid: accountId
  }, undefined, undefined, {
    stoken,
    stmid: mihoyoId
  })
}