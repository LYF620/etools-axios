// types.ts
import type { AxiosRequestConfig, AxiosResponse } from 'axios'
export interface RequestInterceptors {
  // 请求拦截
  requestInterceptors?: (config: AxiosRequestConfig) => AxiosRequestConfig
  requestInterceptorsCatch?: (err: any) => any
  // 响应拦截
  responseInterceptors?: (config: AxiosResponse) => AxiosResponse
  responseInterceptorsCatch?: (err: any) => any
}
// 自定义传入的参数
export interface RequestConfig extends AxiosRequestConfig {
  interceptors?: RequestInterceptors
  beforeRequest: (options: Record<string, any>) => RequestConfig
  afterResponse: (
    resolve: Function,
    reject: Function,
    response: AxiosResponse,
    options: any
  ) => void
  onError: (data: {
    config: any
    request: any
    response: any
    message: any
    stack: any
  }) => void
}

export interface CancelRequestSource {
  [index: string]: () => void
}
