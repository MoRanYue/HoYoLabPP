import type { Dict } from "@/constants/TDict";
import { requestMihoyo } from "./dynamicSignProcessor";
import jsEncrypt from 'jsencrypt'
import type { NumberId } from "@/constants/Api";
import { randomChar, randomMinZero, randomRange, randomUuid4 } from "@/utils/utils";

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

export enum ReplyOrderType {
  heat,
  newest,
  oldest,
  poster
}

export async function articleInfo(id: NumberId, stoken?: string, accountId?: NumberId, mihoyoId?: string) {
  const cookies: Dict = {}
  if (stoken && (accountId || mihoyoId)) {
    cookies.stoken = stoken
    cookies.stuid = accountId
    cookies.mid = mihoyoId
  }

  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/post/api/getPostFull', undefined, undefined, undefined, {
    post_id: id,
  }, undefined, undefined, cookies)
}
export async function homeInfo(gameId: number, page: number = 1, pageCount: number = 20) {
  return await requestMihoyo('get', 'https://bbs-api-static.miyoushe.com/apihub/wapi/webHome', undefined, undefined, undefined, {
    gids: gameId,
    page,
    page_size: pageCount
  }, undefined)
}
export async function dynamicData(postIds: NumberId[]) {
  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/post/wapi/getDynamicData', undefined, undefined, undefined, {
    post_ids: postIds.join(','),
  })
}
export async function postReplyInfo(postId: NumberId, orderType: keyof typeof ReplyOrderType, count: number = 20, lastReplyCount?: number, stoken?: string, accountId?: NumberId, mihoyoId?: string) {
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

  const cookies: Dict = {}
  if (stoken && (accountId || mihoyoId)) {
    cookies.stoken = stoken
    cookies.stuid = accountId
    cookies.mid = mihoyoId
  }

  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/post/api/getPostReplies', undefined, undefined, undefined, params, undefined, undefined, cookies)
}
export async function emotionList() {
  return await requestMihoyo('get', 'https://bbs-api-static.miyoushe.com/misc/api/emoticon_set')
}
export async function replyInfo(postId: NumberId, replyId: NumberId, stoken?: string, accountId?: NumberId, mihoyoId?: string) {
  const cookies: Dict = {}
  if (stoken && (accountId || mihoyoId)) {
    cookies.stoken = stoken
    cookies.mid = mihoyoId
    cookies.stuid = accountId
  }

  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/post/wapi/getRootReplyInfo', undefined, undefined, undefined, {
    post_id: postId,
    reply_id: replyId
  }, undefined, undefined, cookies)
}
export async function subReplyInfo(postId: NumberId, floor: number, count: number = 20, lastReplyId?: NumberId, stoken?: string, accountId?: NumberId, mihoyoId?: string) {
  const params: Dict = {
    post_id: postId,
    floor_id: floor,
    size: count
  }
  if (lastReplyId) {
    params.last_id = lastReplyId
  }

  const cookies: Dict = {}
  if (stoken && (accountId || mihoyoId)) {
    cookies.stoken = stoken
    cookies.mid = mihoyoId
    cookies.stuid = accountId
  }

  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/post/wapi/getSubReplies', undefined, undefined, undefined, params, undefined, undefined, cookies)
}
export async function upvotePost(postId: NumberId, cancel: boolean, stoken: string, accountId?: NumberId, mihoyoId?: string) {
  return await requestMihoyo('post', 'https://bbs-api.miyoushe.com/post/api/post/upvote', undefined, undefined, undefined, undefined, {
    is_cancel: cancel,
    post_id: String(postId),
    // upvote_type: "1"
  }, undefined, {
    stoken,
    stuid: accountId,
    mid: mihoyoId
  })
}
export async function collectPost(postId: NumberId, cancel: boolean, stoken: string, accountId?: NumberId, mihoyoId?: string) {
  return await requestMihoyo('post', 'https://bbs-api.miyoushe.com/post/api/collectPost  ', undefined, undefined, undefined, undefined, {
    is_cancel: cancel,
    post_id: String(postId),
  }, undefined, {
    stoken,
    stuid: accountId,
    mid: mihoyoId
  })
}
export async function upvoteReply(postId: NumberId, replyId: NumberId, cancel: boolean, stoken: string, accountId?: NumberId, mihoyoId?: string) {
  return await requestMihoyo('post', 'https://bbs-api.miyoushe.com/apihub/sapi/upvoteReply', 1, 2, 'k2', undefined, {
    is_cancel: cancel,
    post_id: String(postId),
    reply_id: String(replyId)
  }, undefined, {
    stoken,
    stuid: accountId,
    mid: mihoyoId
  })
}
export async function downvoteReply(postId: NumberId, replyId: NumberId, cancel: boolean, stoken: string, accountId?: NumberId, mihoyoId?: string) {
  return await requestMihoyo('post', 'https://bbs-api.miyoushe.com/apihub/api/downvoteReply', 1, 2, 'k2', undefined, {
    is_cancel: cancel,
    post_id: String(postId),
    reply_id: String(replyId)
  }, undefined, {
    stoken,
    stuid: accountId,
    mid: mihoyoId
  })
}
export async function userInfo(userId: NumberId, stoken?: string, accountId?: NumberId, mihoyoId?: string) {
  const cookies: Dict = {}
  if (stoken && (accountId || mihoyoId)) {
    cookies.stoken = stoken
    cookies.mid = mihoyoId
    cookies.stuid = accountId
  }

  return await requestMihoyo('get', 'https://bbs-api.miyoushe.com/user/api/getUserFullInfo', undefined, undefined, undefined, {
    uid: userId,
    gids: 2
  }, undefined, undefined, cookies)
}

// export async function verifyLtoken(ltoken: string, accountId?: NumberId, mihoyoId?: string) {
  
// }
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
  const encPwd = encryptWithPublicKey(password)

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