import type { Dict } from "@/constants/TDict";
import { requestMihoyo } from "./dynamicSignProcessor";
import jsEncrypt from 'jsencrypt'
import type { InterfaceType, NumberId } from "@/constants/Api";
import { getNowTime, randomChar, randomMinZero, randomRange, randomUuid4 } from "@/utils/utils";

const appId = {
  hoyolabCn: 'bll8iq97cem8'
}

function encryptWithPublicKey(value: string) {
  const publicKey = `-----BEGIN PUBLIC KEY-----
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDDvekdPMHN3AYhm/vktJT+YJr7
cI5DcsNKqdsx5DZX0gDuWFuIjzdwButrIYPNmRJ1G8ybDIF7oDW2eEpm5sMbL9zs
9ExXCdvqrn51qELbqj0XxtMTIpaCHFSI50PfPpTFV9Xt/hmyVwokoOXFlAEgCn+Q
CgGs52bFoYMtyi+xEQIDAQAB
-----END PUBLIC KEY-----`

  const encrypt = new jsEncrypt()
  encrypt.setPublicKey(publicKey)
  return encrypt.encrypt(value)
}

function isTokenV2(token: string) {
  return token.startsWith('v2')
}

async function constructLtoken(ltoken?: string, accountId?: NumberId, mihoyoId?: string) {
  if (!ltoken) {
    return {}
  }

  const cookies: Partial<{
    ltoken: string
    ltuid: string
    ltoken_v2: string
    ltmid: string
    ltmid_v2: string
  }> = {}
  if (isTokenV2(ltoken)) {
    cookies.ltoken_v2 = ltoken
    cookies.ltmid_v2 = mihoyoId
  }
  else {
    cookies.ltoken = ltoken
    cookies.ltmid = mihoyoId
  }
  if (accountId) {
    cookies.ltuid = String(accountId)
  }

  return cookies
}
async function constructStoken(stoken?: string, accountId?: NumberId, mihoyoId?: string) {
  if (!stoken) {
    return {}
  }

  const cookies: Partial<{
    stoken: string
    stuid: string
    mid: string
  }> = {}
  cookies.stoken = stoken
  if (mihoyoId) {
    cookies.mid = mihoyoId
  }
  if (accountId) {
    cookies.stuid = String(accountId)
  }

  return cookies
}
async function setupData(type: InterfaceType, appUrl: string, webUrl: string, token?: string, accountId?: NumberId, mihoyoId?: string) {
  const data: {
    url: string
    cookies: Dict
  } = {
    url: '',
    cookies: {}
  }
  
  if (type == 'web') {
    data.url = webUrl
    data.cookies = await constructLtoken(token, accountId, mihoyoId)
  }
  else if (type == 'application') {
    data.url = appUrl
    data.cookies = await constructStoken(token, accountId, mihoyoId)
  }

  return data
}

export enum ReplyOrderType {
  heat,
  newest,
  oldest,
  poster
}

export enum ForumArticleOrderType {
  heat,
  essence,
  newest,
  newestReply,
}

export async function articleInfo(id: NumberId, type: InterfaceType, token?: string, accountId?: NumberId, mihoyoId?: string) {
  const data = await setupData(type, 'https://bbs-api.miyoushe.com/post/api/getPostFull', 'https://bbs-api.miyoushe.com/post/wapi/getPostFull', token, accountId, mihoyoId)
  return await requestMihoyo('get', data.url, undefined, undefined, undefined, {
    post_id: id,
  }, undefined, undefined, data.cookies)
}
export async function homeInfo(gameId: NumberId, page: number = 1, pageCount: number = 20) {
  return await requestMihoyo('get', 'https://bbs-api-static.miyoushe.com/apihub/wapi/webHome', undefined, undefined, undefined, {
    gids: gameId,
    page,
    page_size: pageCount
  }, undefined)
}
export async function forumArticle(forumId: NumberId, gameId: NumberId, orderType: keyof typeof ForumArticleOrderType, page: number | string | undefined = undefined, pageCount: number = 20, type: InterfaceType) {
  const params: Dict = {
    forum_id: forumId,
    gids: gameId,
    page_size: pageCount,
    last_id: page ?? ''
  }

  if (orderType == 'heat') {
    params.is_hot = 'true'
    params.is_good = 'false'
  }
  else if (orderType == 'essence') {
    params.is_good = 'true'
    params.is_hot = 'false'
  }
  else if (orderType == 'newest') {
    params.sort_type = 2
    params.is_good = 'false'
    params.is_hot = 'false'
  }
  else if (orderType == 'newestReply') {
    params.sort_type = 1
    params.is_good = 'false'
    params.is_hot = 'false'
  }

  const data = await setupData(type, 'https://bbs-api.miyoushe.com/post/api/getForumPostList', 'https://bbs-api.miyoushe.com/post/wapi/getForumPostList')
  return await requestMihoyo('get', data.url, undefined, undefined, undefined, params)
}
export async function dynamicData(postIds: NumberId[]) {
  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/post/wapi/getDynamicData', undefined, undefined, undefined, {
    post_ids: postIds.join(','),
  })
}
export async function postReplyInfo(postId: NumberId, orderType: keyof typeof ReplyOrderType, count: number = 20, lastReplyCount: number | undefined, type: InterfaceType, token?: string, accountId?: NumberId, mihoyoId?: string) {
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
  else if (orderType == 'poster') {
    params.only_master = 'true'
  }

  if (lastReplyCount) {
    params.last_id = lastReplyCount
  }

  const data = await setupData(type, 'https://bbs-api.miyoushe.com/post/api/getPostReplies', 'https://bbs-api.miyoushe.com/post/wapi/getPostReplies', token, accountId, mihoyoId)
  return await requestMihoyo('get', data.url, undefined, undefined, undefined, params, undefined, undefined, data.cookies)
}
export async function emotionList() {
  return await requestMihoyo('get', 'https://bbs-api-static.miyoushe.com/misc/api/emoticon_set')
}
export async function forumInfo() {
  return await requestMihoyo('get', 'https://bbs-api-static.miyoushe.com/apihub/wapi/getAllGamesForums')
}
export async function replyInfo(postId: NumberId, replyId: NumberId, type: InterfaceType, token?: string, accountId?: NumberId, mihoyoId?: string) {
  const data = await setupData(type, 'https://bbs-api.miyoushe.com/post/api/getRootReplyInfo', 'https://bbs-api.miyoushe.com/post/wapi/getRootReplyInfo', token, accountId, mihoyoId)
  return await requestMihoyo('get', data.url, undefined, undefined, undefined, {
    post_id: postId,
    reply_id: replyId
  }, undefined, undefined, data.cookies)
}
export async function subReplyInfo(postId: NumberId, floor: number, count: number = 20, lastReplyId: NumberId | undefined, type: InterfaceType, token?: string, accountId?: NumberId, mihoyoId?: string) {
  const params: Dict = {
    post_id: postId,
    floor_id: floor,
    size: count
  }
  if (lastReplyId) {
    params.last_id = lastReplyId
  }

  const data = await setupData(type, 'https://bbs-api.miyoushe.com/post/api/getSubReplies', 'https://bbs-api.miyoushe.com/post/wapi/getSubReplies', token, accountId, mihoyoId)
  return await requestMihoyo('get', data.url, undefined, undefined, undefined, params, undefined, undefined, data.cookies)
}
export async function upvotePost(postId: NumberId, cancel: boolean, type: InterfaceType, token: string, accountId?: NumberId, mihoyoId?: string) {
  const data = await setupData(type, 'https://bbs-api.miyoushe.com/post/api/post/upvote', 'https://bbs-api.miyoushe.com/post/wapi/post/upvote', token, accountId, mihoyoId)
  return await requestMihoyo('post', data.url, undefined, undefined, undefined, undefined, {
    is_cancel: cancel,
    post_id: postId,
    // upvote_type: "1"
  }, undefined, data.cookies)
}
export async function collectPost(postId: NumberId, cancel: boolean, type: InterfaceType, token: string, accountId?: NumberId, mihoyoId?: string) {
  const data = await setupData(type, 'https://bbs-api.miyoushe.com/post/api/collectPost', 'https://bbs-api.miyoushe.com/post/wapi/collectPost', token, accountId, mihoyoId)
  return await requestMihoyo('post', data.url, undefined, undefined, undefined, undefined, {
    is_cancel: cancel,
    post_id: String(postId),
  }, undefined, data.cookies)
}
export async function upvoteReply(postId: NumberId, replyId: NumberId, cancel: boolean, type: InterfaceType, token: string, accountId?: NumberId, mihoyoId?: string) {
  const data = await setupData(type, 'https://bbs-api.miyoushe.com/apihub/sapi/upvoteReply', 'https://bbs-api.miyoushe.com/apihub/api/upvoteReply', token, accountId, mihoyoId)
  return await requestMihoyo('post', data.url, 1, 2, 'k2', undefined, {
    is_cancel: cancel,
    post_id: String(postId),
    reply_id: String(replyId)
  }, undefined, data.cookies)
}
export async function downvoteReply(postId: NumberId, replyId: NumberId, cancel: boolean, type: InterfaceType, token: string, accountId?: NumberId, mihoyoId?: string) {
  const data = await setupData(type, 'https://bbs-api.miyoushe.com/apihub/api/downvoteReply', 'https://bbs-api.miyoushe.com/apihub/wapi/downvoteReply', token, accountId, mihoyoId)
  return await requestMihoyo('post', data.url, 1, 2, 'k2', undefined, {
    is_cancel: cancel,
    post_id: String(postId),
    reply_id: String(replyId)
  }, undefined, data.cookies)
}
export async function userInfo(userId: NumberId, type: InterfaceType, token?: string, accountId?: NumberId, mihoyoId?: string) {
  const data = await setupData(type, 'https://bbs-api.miyoushe.com/user/api/getUserFullInfo', 'https://bbs-api.miyoushe.com/user/wapi/getUserFullInfo', token, accountId, mihoyoId)
  return await requestMihoyo('get', data.url, undefined, undefined, undefined, {
    uid: userId,
    gids: 2
  }, undefined, undefined, data.cookies)
}
export async function followUser(userId: NumberId, type: InterfaceType, token: string, accountId: NumberId, mihoyoId: string) {
  const data = await setupData(type, '', 'https://bbs-api.miyoushe.com/timeline/wapi/follow', token, accountId, mihoyoId)
  return await requestMihoyo('post', data.url, undefined, undefined, undefined, undefined, {
    entity_id: String(userId)
  }, undefined, data.cookies)
}
export async function unfollowUser(userId: NumberId, type: InterfaceType, token: string, accountId: NumberId, mihoyoId: string) {
  const data = await setupData(type, '', 'https://bbs-api.miyoushe.com/timeline/wapi/unfollow', token, accountId, mihoyoId)
  return await requestMihoyo('post', data.url, undefined, undefined, undefined, undefined, {
    entity_id: String(userId)
  }, undefined, data.cookies)
}

// export async function verifyLtoken(ltoken: string, accountId?: NumberId, mihoyoId?: string) {
  
// }
export async function loginMihoyoByPasswordCreateMmt(account: string) {
  const time = getNowTime()

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
  const encPwd = encryptWithPublicKey(password)

  return await requestMihoyo('post', 'https://webapi.account.mihoyo.com/Api/login_by_password', undefined, undefined, undefined, {
    mmt_key: mmtKey,
    account,
    password: encPwd,
    is_crypto: true,
    source: 'user.mihoyo.com',
    t: getNowTime()
  }, undefined, {
    Referer: 'https://user.mihoyo.com/',
  })
}

export async function loginHoyolabByPassword(account: string, password: string, fingerprint: string) {
  const encAcc = encryptWithPublicKey(account)
  const encPwd = encryptWithPublicKey(password)

  return await requestMihoyo('post', 'https://passport-api.mihoyo.com/account/ma-cn-passport/app/loginByPassword', undefined, undefined, undefined, undefined, {
    account: encAcc,
    password: encPwd
  }, {
    'x-rpc-app_id': appId.hoyolabCn,
    'x-rpc-client_type': 2,
    'x-rpc-device_fp': fingerprint,
    'x-rpc-game_biz': 'bbs_cn',
    'x-rpc-device_id': randomChar(16)
  })
}

export async function generateHoyolabQrcode(deviceId: string) {
  return await requestMihoyo('post', 'https://passport-api.miyoushe.com/account/ma-cn-passport/web/createQRLogin', undefined, undefined, undefined, undefined, undefined, {
    'x-rpc-app_id': appId.hoyolabCn,
    'x-rpc-device_id': deviceId
  })
}
export async function checkHoyolabQrcodeStatus(deviceId: string, deviceFp: string, ticket: string) {
  return await requestMihoyo('post', 'https://passport-api.miyoushe.com/account/ma-cn-passport/web/queryQRLoginStatus', undefined, undefined, undefined, undefined, {
    ticket
  }, {
    Origin: 'https://user.miyoushe.com/',
    Referer: 'https://user.miyoushe.com/',
    'x-rpc-app_id': appId.hoyolabCn,
    'x-rpc-device_id': deviceId,
    'x-rpc-device_fp': deviceFp
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
export async function getStokenV2ByStokenV1(stokenV1: string, accountId: NumberId) {
  return await requestMihoyo('post', 'https://passport-api.mihoyo.com/account/ma-cn-session/app/getTokenBySToken', undefined, undefined, undefined, undefined, undefined, {
    'x-rpc-app_id': appId.hoyolabCn
  }, {
    stoken: stokenV1,
    stuid: accountId
  })
}
export async function getHoyolabCookieTokenByStoken(stokenV1: string, mihoyoId: string, accountId: NumberId) {
  return await requestMihoyo('get', 'https://api-takumi.mihoyo.com/auth/api/getCookieAccountInfoBySToken', undefined, undefined, undefined, {
    stoken: stokenV1,
    uid: accountId
  }, undefined, undefined, {
    stoken: stokenV1,
    stuid: accountId,
  })
}
export async function getFingerprint() {
  const deviceId = randomUuid4()
  const brand = 'Xiaomi'

  return await requestMihoyo('post', 'https://public-data-api.mihoyo.com/device-fp/api/getFp', undefined, undefined, undefined, undefined, {
    device_id: deviceId,
    seed_id: randomUuid4(),
    seed_time: Math.floor(Date.now()).toString(),
    platform: '2',
    device_fp: randomChar(13, '0123456789abcdef'),
    app_name: 'bbs_cn',
    bbs_device_id: randomUuid4(),
    ext_fields: JSON.stringify({
      cpuType: randomChar(8),
      romCapacity: randomRange(32, 512).toString(),
      productName: randomChar(6),
      romRemain: randomRange(22, 333).toString(),
      manufacturer: brand,
      appMemory: randomRange(11, 1024).toString(),
      hostname: 'xiaomi.com',
      screenSize: `${randomRange(640, 1440)}x${randomRange(720, 3120)}`,
      osVersion: randomRange(7, 14).toString(),
      aaid: randomUuid4(),
      vendor: randomChar(5),
      accelerometer: `${randomRange(0, 100) / 1000}x${randomRange(0, 100) / 100}x${randomRange(0.0, 100) / 10}`,
      buildTags: randomChar(10),
      model: randomChar(10),
      brand,
      oaid: randomChar(16),
      hardware: 'qcom',
      deviceType: randomChar(6),
      devId: randomChar(4),
      serialNumber: randomRange(10000000000, 99999999999).toString(),
      buildTime: randomMinZero(1600890524244).toString(),
      buildUser: 'builder',
      ramCapacity: randomRange(32, 9999999).toString(),
      magnetometer: `${randomRange(0, 100) / 1000}x${randomRange(0, 100) / 100}x${randomRange(0.0, 100) / 10}`,
      display: randomChar(30),
      ramRemain: randomRange(32, 9999999).toString(),
      deviceInfo: randomChar(100),
      gyroscope: `${randomRange(0, 100) / 1000}x${randomRange(0, 100) / 100}x${randomRange(0.0, 100) / 10}`,
      vaid: randomChar(16),
      buildType: 'user',
      sdkVersion: randomRange(17, 40).toString(),
      board: randomChar(30)
    })
  }, {
    'x-rpc-device_id': deviceId
  })
}

export async function hoyolabCreateVerification(stoken: string, accountId?: NumberId, mihoyoId?: string) {
  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/misc/api/createVerification', undefined, undefined, undefined, {
    is_high: 'true'
  }, undefined, undefined, await constructStoken(stoken, accountId, mihoyoId))
}
export async function hoyolabVerifyVerification(challenge: string, validate: string, seccode: string, stoken: string, accountId?: NumberId, mihoyoId?: string) {
  return await requestMihoyo('post', 'https://bbs-api.miyoushe.com/misc/api/verifyVerification', undefined, undefined, undefined, undefined, {
    geetest_challenge: challenge,
    geetest_validate: validate,
    geetest_seccode: seccode
  }, undefined, await constructStoken(stoken, accountId, mihoyoId))
}