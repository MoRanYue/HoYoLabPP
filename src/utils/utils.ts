import type { Dict } from "@/constants/TDict";
import { isString } from "@vue/shared"

export function toPascalCase(val: string): string {
  return val.replace(/(^\w|-\w)/g, (c: string) => {
    return c.slice(-1).toUpperCase();
  });
}
export function interfaceHasKey(interfaceClass: ObjectConstructor, key: string): boolean {
  return new interfaceClass().hasOwnProperty(key)
}
export function getUrlObj(str: unknown, base?: string | URL): URL | undefined {
  if (str instanceof URL) {
    return str
  }
  else if (isString(str)) {
    try {
      return new URL(str, base)
    } catch (_) {
      return undefined
    }
  }
  else {
    return undefined
  }
}

export function randomMinZero(max: number) {
  return Math.floor(Math.random() * (max + 1))
}

export function randomRange(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

export function randomRgb(alpha: boolean = false) {
  return [randomRange(0, 255), randomRange(0, 255), randomRange(0, 255), alpha ? randomRange(0, 255) : 255]
}

export function randomChar(length: number, collection: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let str: string = ''
  for (let i = 0; i < length; i++) {
    str += collection[randomMinZero(collection.length - 1)]
  }
  return str
}

export function randomUuid4() {
  let str: string = ''
  for (let i = 0; i < 4; i++) {
    str += randomChar(4, '0123456789abcdef')

    if (i < 3) {
      str += '-'
    }
  }
  return str
}

export function clamp(x: number, min: number, max: number) {
  return Math.min(Math.max(x, min), max)
}

export function dictToQuery(params: Dict): string {
  const queryItems: string[] = []

  for (const k in params) {
    if (Object.prototype.hasOwnProperty.call(params, k)) {
      const v = params[k];
      
      queryItems.push(`${k}=${v}`)
    }
  }

  return queryItems.sort().join('&')
}

export function dictToCookie(cookies: Dict): string {
  let cookie: string = ''

  for (const k in cookies) {
    if (Object.prototype.hasOwnProperty.call(cookies, k)) {
      const v = cookies[k];
      
      cookie += `${k}=${v}; `
    }
  }

  return cookie
}

export function cookieToDict(cookies: string) {
  const dict: Dict = {}

  cookies.split(/; */).forEach(cookie => {
    const [k, v] = cookie.split('=', 2)

    if (!['path', 'httponly', 'max-age', 'domain', 'secure'].includes(k.toLowerCase())) {
      dict[k] = v
    }
  })

  return dict
}

export function formatTime(time: Date, addtionalZeros: boolean = true, removeMs: boolean = true): string {
  const year = time.getFullYear(),
  month = time.getMonth() + 1,
  day = time.getDate(),
  hour = time.getHours(),
  minute = time.getMinutes(),
  second = time.getSeconds(),
  milesecond = time.getMilliseconds()

  const m = String(month).padStart(2, '0'),
  d = String(day).padStart(2, '0'),
  h = String(hour).padStart(2, '0'),
  min = String(minute).padStart(2, '0'),
  s = String(second).padStart(2, '0'),
  ms = String(milesecond).padStart(3, '0')

  let str = `${year}年${m}月${d}日 ${h}:${min}:${s}`
  if (!removeMs) {
    str += '.' + ms
  }

  return str
}

export function reverseColor(color: string) {
  const colorNumber = '0x' + color.slice(1)
  const str = '000000' + (0xffffff - parseInt(colorNumber, 16)).toString(16)
  return '#' + str.substring(str.length - 6, str.length)
}

export function htmlTag(name: string, attributes: Dict | Record<string, {
  single: boolean
  value: string
}> = {}, inner: any = '', single: boolean = false): string {
  let tag = '<' + name
  for (const k in attributes) {
    if (Object.prototype.hasOwnProperty.call(attributes, k)) {
      const v = attributes[k];

      if (typeof v == 'object') {
        if (v.single) {
          tag += ' ' + k
        }
        else {
          tag += ` ${k}="${String(v)}"`
        }
      }
      else {
        tag += ` ${k}="${String(v)}"`
      }
    }
  }

  if (single) {
    return tag + '>'
  }

  return tag + '>' + String(inner) + '</' + name + '>'
}