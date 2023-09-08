import type { Dict } from "@/constants/TDict";
import { emotionList } from "./interfaces";

let emotions: Record<string, {
  url: string
}> | undefined = undefined
let deviceFp: string = ''
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

export function getEmotions() {
  return emotions
}