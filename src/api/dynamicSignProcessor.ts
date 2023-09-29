import api from './index'
import { type Method } from 'axios'
import type { Dict } from '../constants/TDict'
import type { SaltType, ClientType } from '../constants/DynamicSign'
import { notify } from '@/utils/notification'
import { constructApiError } from '@/utils/utils'

export async function requestMihoyo(method: Method, url: string, dsType?: 1 | 2, clientType?: ClientType, saltType?: keyof typeof SaltType, params?: Dict, data?: any, headers?: Dict, cookies?: Dict | string, wontNotifyError: boolean = false) {
  const res = await api.postJson('/rms/requestMiHoYo', {
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

  if (!wontNotifyError && ((res.retcode && res.retcode != 0) || (res.code && res.code != 200))) {
    constructApiError(res.retcode || res.code, res.message)
  }

  return res
}