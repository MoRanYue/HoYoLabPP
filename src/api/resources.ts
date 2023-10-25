import type { Dict } from "@/constants/TDict";
import { emotionList, forumInfo } from "./interfaces";
import { notify } from "@/utils/notification";

const maxRetryingTimes = 6

let emotions: Record<string, {
  url: string
}> | undefined = undefined
function initEmotions(tryingTimes: number = 1) {
  emotionList().then(emotionInfo => {
    emotions = {}
    emotionInfo.data.list.forEach((parentEmotion: Dict) => {
      const childEmotions: Dict = parentEmotion.list
  
      childEmotions.forEach((childEmotion: Dict) => {
        emotions[childEmotion.name] = {
          url: <string>childEmotion.icon
        }
      });
    });
  }).catch(e => {
    notify(`表情包信息获取失败，已尝试${tryingTimes}次`, '请求失败', 'warning')
    if (tryingTimes < maxRetryingTimes) {
      initEmotions(tryingTimes + 1)
    }
  })
}

interface VideoForum {
  id: number
  name: string
  desc: string
}

let forums: Record<string, {
  id: number
  name: string
  desc: string
  headerPicture: string
  icon: string
  videoForums: VideoForum[]
}[]> | undefined = undefined
function initForums(tryingTimes: number = 1) {
  forumInfo().then(forumData => {
    forums = {}
    forumData.data.list.forEach(parentForum => {
      forums[String(parentForum.game_id)] = []

      parentForum.forums.forEach(childForum => {
        const videoForums: VideoForum[] = []
        childForum.video_cate_list.forEach(videoForum => {
          videoForums.push({
            id: videoForum.id,
            name: videoForum.name,
            desc: videoForum.desc
          })
        });

        forums[parentForum.game_id].push({
          id: childForum.id,
          desc: childForum.des,
          name: childForum.name,
          icon: childForum.icon,
          headerPicture: childForum.header_image,
          videoForums
        })
      });
    });
  }).catch(e => {
    notify(`论坛分区信息获取失败，已尝试${tryingTimes}次`, '请求失败', 'warning')
    if (tryingTimes < maxRetryingTimes) {
      initForums(tryingTimes + 1)
    }
  })
}

initEmotions()
initForums()

export function getEmotions() {
  return emotions
}
export function getForums() {
  return forums
}