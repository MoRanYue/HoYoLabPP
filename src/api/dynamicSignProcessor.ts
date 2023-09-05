import api from './index'
import { type Method } from 'axios'
import type { Dict } from '../constants/TDict'
import type { SaltType, ClientType } from '../constants/DynamicSign'

export async function requestMihoyo(method: Method, url: string, dsType?: 1 | 2, clientType?: ClientType, saltType?: keyof typeof SaltType, params?: Dict, data?: any, headers?: Dict, cookies?: Dict | string) {
  return await api.postJson('/requestMiHoYo', {
    method,
    url,
    client: clientType,
    salt: saltType,
    ds: dsType,
    params,
    data,
    headers,
    cookies
  })
}