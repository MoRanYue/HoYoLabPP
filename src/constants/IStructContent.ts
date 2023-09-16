import type { Dict } from "./TDict";

export enum ArticleViewType {
  text,
  photo,
  video
}

export interface StructTextAttribute {
  color: string
  bold: boolean
  italic: boolean
  link: string
  align: 'center' | 'left' | 'right' | 'justify'
}

export interface StructImageAttribute {
  width: number,
  height: number
  size?: number
  ext?: 'png' | 'jpg'
}

export interface StructImage {
  image: string
}

export interface StructVideo {
  vod: {
    id: string,
    duration: 84000,
    cover: string,
    resolutions: {
      url: string,
      definition: string
      height: number
      width: number
      bitrate: number
      size: number
      format: string
      label: string
    }[]
    view_num: number
    review_status: number
    transcoding_status: number
  }
}

export interface StructTab {
  backup_text: string,
  fold: {
    title: StructContent[]
    content: StructContent[]
    id: string
    size: string
  }
}

export interface StructGiftLinkCard {
  link_card: {
    link_type: 2
    button_text: string
    card_id: string
    title: string
    card_status: number
    landing_url_type: number
    cover: string
    landing_url: string
    market_price: string
    price: string
    origin_url: string
  }
}
export interface StructArticleLinkCard {
  link_card: {
    link_type: 1
    origin_url: string
    card_id: string
    card_status: number
    title: string
    landing_url_type: number
    landing_url: string
    cover: string
  }
}

export interface StructDividingLine {
  divider: 'line_1' | 'line_2' | 'line_3' | 'line_4'
}

export interface StructContent {
  insert: string | StructImage | StructVideo | StructTab | StructDividingLine | StructArticleLinkCard | StructGiftLinkCard
  attributes?: Partial<StructTextAttribute | StructImageAttribute>
}