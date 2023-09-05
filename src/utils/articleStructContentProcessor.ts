import type { StructContent, StructVideo, StructImage, StructTextAttribute, StructImageAttribute, StructTab, StructDividingLine } from "@/constants/IStructContent";
import { htmlTag, reverseColor } from "./utils";
import { emotionList } from "@/api/interfaces";
import { getEmotions } from '@/api/resources'
import convertColor from 'color-convert'
import type { Dict } from "@/constants/TDict";

export async function processStructContent(data: string | StructContent[]) {
  let info: StructContent[] = <StructContent[]>data
  if (typeof data == 'string') {
    info = <StructContent[]>JSON.parse(data)
  }
  
  if (!Array.isArray(info)) {
    return '错误'
  }

  const emotions = getEmotions()
  if (!emotions) {
    return '错误'
  }

  let str: string = ''
  for (let i = 0; i < info.length; i++) {
    const part = info[i];

    let style = ''

    if (typeof part.insert == 'string') {
      part.insert = part.insert.replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('\n', '<br>')

      let pos: number = -1
      let char: string | undefined = undefined
      let advanced: number = -1
      let parsed: boolean = true
      function advance() {
        pos++
        advanced++
        char = part.insert[pos]
      }

      let content: string = ''
      advance()
      while (char != undefined) {
        if (char == '_') {
          advance()
          if (char == '(') {
            advance()
            
            let emotionName: string = ''
            while (char != undefined && char != ')') {
              emotionName += char
              advance()
            }
            advance()

            content += htmlTag('div', {
              'class': 'hoyolab-emotion'
            }, htmlTag('img', {
              src: emotions[emotionName].url,
              alt: emotionName,
              title: emotionName
            }, undefined, true))

            continue
          }
          else {
            parsed = false
          }
        }

        if (!parsed) {
          pos -= advanced
          char = part.insert[pos]
          content += char
          advance()
        }
        else {
          content += char
          advance()
        }

        advanced = 0
      }

      if (part.attributes) {
        const attrs = <Partial<StructTextAttribute>>part.attributes

        if (attrs.bold) {
          style += 'font-weight: bold;'
        }
        if (attrs.italic) {
          style += 'font-style: italic;'
        }
        if (attrs.align) {
          style += `text-align: ${attrs.align};`
        }
        if (attrs.color) {
          if (!attrs.color.startsWith('#')) {
            attrs.color = convertColor.keyword.hex(attrs.color)
          }

          style += `color: ${reverseColor(attrs.color)};`
        }

        if (attrs.link) {
          str += htmlTag('a', {
            style,
            href: attrs.link
          }, content)
        }
        else {
          str += htmlTag('span', {
            style
          }, content)
        }
      }
      else {
        str += content
      }
    }
    else if (typeof part.insert == 'object') {
      if (part.insert.image) {
        const attrs = <Partial<StructImageAttribute>>part.attributes

        if (attrs) {
          if (attrs.width) {
            style += `width: ${attrs.width}px;`
          }
          if (attrs.height) {
            style += `height: ${attrs.height}px;`
          }
        }

        str += htmlTag('div', {
          'class': 'hoyolab-image'
        }, htmlTag('img', {
          style,
          alt: part.insert.image,
          src: part.insert.image
        }, undefined, true))
      }
      else if (part.insert.vod) {
        const videoInfo = <StructVideo['vod']>part.insert.vod

        const theMostClearResolution = videoInfo.resolutions[videoInfo.resolutions.length - 1]
        style += `width: ${theMostClearResolution.width};height: ${theMostClearResolution.height};`

        let mimeType: string
        switch (theMostClearResolution.format.toLowerCase()) {
          default:
            mimeType = 'video/mp4'
            break;
        }

        str += htmlTag('div', {
          'class': 'hoyolab-video'
        }, htmlTag('video', {
          controls: {single: true},
          style,
          poster: videoInfo.cover,
        }, htmlTag('source', {
          src: theMostClearResolution.url,
          type: mimeType
        })))
      }
      else if (part.insert.fold) {
        const tabInfo = <StructTab['fold']>part.insert.fold

        const titleHtml = await processStructContent(tabInfo.title)
        const contentHtml = await processStructContent(tabInfo.content)

        str += htmlTag('section', {
          'class': 'hoyolab-tab'
        }, htmlTag('details', undefined, htmlTag('summary', undefined, titleHtml) + htmlTag('div', {
          'class': 'content'
        }, contentHtml)))
      }
      else if (part.insert.divider) {
        const dividingLine = <StructDividingLine['divider']>part.insert.divider

        let className: string
        switch (dividingLine) {
          case 'line_2':
            className = 'hr-2'
            break;

          case 'line_3':
            className = 'hr-3'
            break;
          
          case 'line_4':
            className = 'hr-4'
            break;
        
          default:
            className = 'hr-1'
            break;
        }

        str += htmlTag('hr', {
          'class': className
        }, undefined, true)
      }
    }
  }

  return str
}