import type { StructContent, StructVideo, StructImage, StructTextAttribute, StructImageAttribute, StructTab, StructDividingLine, StructArticleLinkCard, StructGiftLinkCard, StructMention } from "@/constants/IStructContent";
import { htmlTag, reverseColor } from "./utils";
import { getEmotions } from '@/api/resources'
import convertColor from 'color-convert'

function isMihoyoUrl(url: string) {
  const host = new URL(url).host.toLowerCase()
  return host.includes('miyoushe.com') || host.includes('mihoyo.com') || host.includes('hoyolab.com') || host.includes('hoyoverse.com')
}
function isArticleUrl(url: string) {
  const urlData = new URL(url)

  return isMihoyoUrl(url) && urlData.pathname.toLowerCase().includes('article')
}
function isUserUrl(url: string) {
  const urlData = new URL(url)

  return isMihoyoUrl(url) && urlData.pathname.toLowerCase().includes('accountcenter')
}
function getIdInUrl(url: string) {
  const urlData = new URL(url)
  return urlData.pathname.split('/').pop()
}
function getUserIdInUrl(url: string) {
  const urlData = new URL(url)
  return urlData.searchParams.get('id')
}

export async function processStructContent(data: string | StructContent[]) {
  let info: StructContent[] = <StructContent[]>data
  if (typeof data == 'string') {
    info = <StructContent[]>JSON.parse(data)
  }
  
  if (!Array.isArray(info)) {
    return '错误'
  }

  const emotions = getEmotions()

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

            if (!emotions) {
              continue
            }

            content += htmlTag('div', {
              'class': 'hoyolab-emotion'
            }, htmlTag('img', {
              src: emotions[emotionName].url,
              alt: emotionName,
              title: emotionName,
              loading: 'lazy'
            }, undefined, true))

            continue
          }
          else {
            parsed = false
          }
        }

        if (parsed) {
          content += char
        }
        else {
          pos -= advanced
          char = part.insert[pos]
          content += char
        }
        advance()
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
          let url: string = attrs.link
          if (isArticleUrl(url)) {
            url = `/article/${getIdInUrl(url)}`
          }
          else if (isUserUrl(url)) {
            url = `/user/${getUserIdInUrl(url)}`
          }

          str += htmlTag('a', {
            style,
            href: url,
            target: '_blank'
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
          src: part.insert.image,
          loading: 'lazy'
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
      else if (part.insert.link_card) {
        if (part.insert.link_card.link_type == 1) {
          const linkCard = <StructArticleLinkCard['link_card']>part.insert.link_card

          const postId = getIdInUrl(linkCard.origin_url)

          str += htmlTag('div', {
            'class': 'hoyolab-link-card article'
          }, htmlTag('div', {
            'class': 'cover'
          }, htmlTag('a', {
            href: `/article/${postId}`,
            title: postId,
            target: '_blank'
          }, htmlTag('img', {
            src: linkCard.cover,
            loading: 'lazy'
          }, undefined, true))) + htmlTag('div', {
            'class': 'content'
          }, htmlTag('div', {
            'class': 'title'
          }, htmlTag('a', {
            href: `/article/${postId}`,
            title: postId,
            target: '_blank'
          }, linkCard.title))))
        }
        else if (part.insert.link_card.link_type == 2) {
          const linkCard = <StructGiftLinkCard['link_card']>part.insert.link_card

          const giftId = getIdInUrl(linkCard.origin_url)

          str += htmlTag('div', {
            'class': 'hoyolab-link-card gift'
          }, htmlTag('div', {
            'class': 'cover'
          }, htmlTag('a', {
            href: linkCard.origin_url,
            title: giftId,
            target: '_blank'
          }, htmlTag('img', {
            src: linkCard.cover,
            loading: 'lazy'
          }, undefined, true))) + htmlTag('div', {
            'class': 'content'
          }, htmlTag('div', {
            'class': 'title'
          }, htmlTag('a', {
            href: linkCard.origin_url,
            title: giftId,
            target: '_blank'
          }, linkCard.title)) + htmlTag('div', {
            'class': 'price'
          }, htmlTag('span', undefined, linkCard.price))))
        }
      }
      else if (part.insert.mention) {
        const mention = <StructMention['mention']>part.insert.mention

        str += htmlTag('span', {
          'class': 'hoyolab-mention'
        }, htmlTag('span', {
          'class': 'at'
        }, '@') + htmlTag('a', {
          href: `/user/${mention.uid}`,
          title: mention.nickname,
          target: '_blank'
        }, mention.nickname))
      }
      else {
        str += htmlTag('div', {
          'class': 'hoyolab-unknown-content'
        }, htmlTag('span', {
          'class': 'title'
        }, '未知内容') + htmlTag('span', {
          'class': 'content'
        }, JSON.stringify(part)))
      }
    }
  }

  return str
}