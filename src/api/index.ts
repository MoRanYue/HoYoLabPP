import axios, { type AxiosInstance, type InternalAxiosRequestConfig, type AxiosResponse } from 'axios'
import { toValue, useBrowserLocation } from '@vueuse/core'
import type { Dict } from '../constants/TDict'

const location = toValue(useBrowserLocation())
const fetch: AxiosInstance = axios.create({
  baseURL: `${location.origin}/api`,
  timeout: 15000,
  decompress: true,
  withCredentials: true,
})

fetch.interceptors.request.use(async (cfg: InternalAxiosRequestConfig) => {
  // 在发送请求之前做些什么

  // 用于调试
  if (cfg.baseURL!.includes('localhost')) {
    cfg.baseURL = 'http://localhost:3002/api'
  }
  
  return cfg
}, async (err: Error) => {
  return Promise.reject(err)
})

fetch.interceptors.response.use(async (res: AxiosResponse) => {
  // 对响应数据做点什么

  return res
}, async (err: Error) => {
  return Promise.reject(err)
})

export default {
  fetch,

  async getJson<T>(url: string, params?: Dict, headers?: Dict): Promise<T> {
    const res = await fetch.get<T>(url, {
      params,
      headers
    })
    return res.data
  },
  async getData(url: string, params?: Dict, headers?: Dict): Promise<string> {
    const res = await this.get(url, params, headers)
    return res.data
  },
  async get(url: string, params?: Dict, headers?: Dict): Promise<AxiosResponse> {
    const res = await fetch.get(url, {
      params, 
      headers
    })
    return res
  },

  async postJson<T>(url: string, data?: any, headers?: Dict): Promise<T> {
    const res = await fetch.post<T>(url, data, {
      headers,
    })
    return res.data
  },
  async postData(url: string, data?: any, headers?: Dict): Promise<any> {
    const res = await this.post(url, data, headers)
    return res.data
  },
  async post(url: string, data?: any, headers?: Dict): Promise<AxiosResponse> {
    const res = await fetch.post(url, data, {
      headers
    })
    return res
  },

  async putJson<T>(url: string, data?: any): Promise<T> {
    const res = await fetch.put<T>(url, data)
    return res.data
  },
  async putData(url: string, data?: any): Promise<any> {
    const res = await this.put(url, data)
    return res.data
  },
  async put(url: string, data?: any): Promise<AxiosResponse> {
    const res = await fetch.put(url, data)
    return res
  },

  async delJson<T>(url: string, params?: Dict): Promise<T> {
    const res = await fetch.delete<T>(url, {
      params,
    })
    return res.data
  },
  async delData(url: string, params?: Dict): Promise<any> {
    const res = await this.del(url, params)
    return res.data
  },
  async del(url: string, params?: Dict): Promise<AxiosResponse> {
    const res = await fetch.delete(url, {
      params
    })
    return res
  },

  async head(url: string, params?: Dict): Promise<number | undefined> {
    const res = await fetch.head(url, {
      params
    })
    
    const contentLength = res.headers['Content-Length']
    if (contentLength) {
      return parseInt(contentLength.toString())
    }
  },

  async segmentedDownload(url: string, params?: Dict): Promise<Blob> {
    const chunkSize = 1024 ^ 2 * 5 // 5MB
    let totalBytes: number | undefined = 0

    async function request(start: number, end: number): Promise<ArrayBuffer> {
      const res = await fetch.get(url, {
        params,
        headers: {
          Range: `bytes=${start}-${end}`
        },
        responseType: 'arraybuffer'
      })
      return res.data
    }
    async function connectData(arr: ArrayBuffer[]) {
      let totalBytes = 0
      arr.forEach(arrBuf => {
        totalBytes += arrBuf.byteLength
      })
      
      const result = new Uint8Array(totalBytes)
      let offset = 0
      arr.forEach(arrBuf => {
        result.set(new Uint8Array(arrBuf), offset)
        offset += arrBuf.byteLength
      })

      return result
    }
    async function toBlob(data: Uint8Array) {
      return new Blob([data], {
        type: 'application/octet-stream'
      })
    }
    
    totalBytes = await this.head(url, params)
    if (!totalBytes) {
      const res = await fetch.get(url, {
        params,
        responseType: 'blob'
      })
      return <Blob>res.data
    }
    const chunkNum = Math.ceil(totalBytes / chunkSize)
    const arrBufs: ArrayBuffer[] = []
    for (let i = 0; i < chunkNum; i++) {
      const start = i * chunkSize
      const end = start + chunkNum - 1

      const chunk = await request(start, end)
      arrBufs.push(chunk)
    }

    const result = await connectData(arrBufs)
    return await toBlob(result)
  }
}