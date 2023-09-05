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

export interface StructDividingLine {
  divider: 'line_1' | 'line_2' | 'line_3' | 'line_4'
}

export interface StructContent {
  insert: string | StructImage | StructVideo | StructTab | StructDividingLine
  attributes?: Partial<StructTextAttribute | StructImageAttribute>
}