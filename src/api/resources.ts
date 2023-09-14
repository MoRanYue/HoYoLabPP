import type { Dict } from "@/constants/TDict";
import { emotionList, forumInfo } from "./interfaces";

let emotions: Record<string, {
  url: string
}> | undefined = undefined
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
})

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
})

export function getEmotions() {
  return emotions
}
export function getForums() {
  return forums
}