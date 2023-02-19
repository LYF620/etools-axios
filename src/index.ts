import axios, { Axios, AxiosResponse } from 'axios'
import type { AxiosInstance, AxiosRequestConfig } from 'axios'
import {
  CancelRequestSource,
  RequestConfig,
  RequestInterceptors
} from './types'

class Request {
  // axios 实例对象
  instance: AxiosInstance
  // 自定义拦截器对象
  customInterceptors?: RequestInterceptors
  // 自定义配置
  customConfig: RequestConfig
  // 取消请求
  cancelRequestSource?: CancelRequestSource[]
  // 请求URl列表
  requestUrlList?: string[]

  constructor(config: RequestConfig) {
    this.instance = axios.create(config)
    this.customInterceptors = config.interceptors
    this.customConfig = config
    this.requestUrlList = []
    this.cancelRequestSource = []

    // 处理beforeRequest
    if (this.instance.hasOwnProperty('beforeRequest')) {
      config = config.beforeRequest(config)
    }
    // 处理类拦截器
    this.instance.interceptors.request.use(
      (res: AxiosRequestConfig) => {
        console.log('全局请求拦截器')
        return res
      },
      (err: any) => err
    )

    // 使用实例拦截器
    this.instance.interceptors.request.use(
      this.customInterceptors?.requestInterceptors,
      this.customInterceptors?.requestInterceptorsCatch
    )
    this.instance.interceptors.response.use(
      this.customInterceptors?.responseInterceptors,
      this.customInterceptors?.responseInterceptorsCatch
    )

    this.instance.interceptors.response.use(
      // 因为我们接口的数据都在res.data下，所以我们直接返回res.data
      (res: AxiosResponse) => {
        console.log('全局响应拦截器')
        return res.data
      },
      (err: any) => err
    )
  }

  request<T>(config: AxiosRequestConfig): Promise<T> {
    const url = config.url
    return new Promise((resolve, reject) => {
      // 记录请求
      if (url) {
        this.requestUrlList?.push(url)
        // axios.CancelToken 接受对应请求的取消函数
        config.cancelToken = new axios.CancelToken(cancel => {
          this.cancelRequestSource?.push({
            [url]: cancel
          })
        })
      }

      this.instance
        .request(config)
        .then((res: AxiosResponse) => {
          this.customConfig.afterResponse(
            resolve,
            reject,
            res,
            this.customConfig
          )
        })
        .catch(err => {
          this.customConfig.onError(err)
        })
    })
  }

  // 获取存储cancelToken的索引
  private getCancelSourceIndex(url: string) {
    return this.cancelRequestSource?.findIndex(item => {
      return Object.keys(item)[0] === url
    })
  }

  // 执行cancel后清空对应source
  private delSource(url: string) {
    const requestUrlIndex = this.requestUrlList?.findIndex(u => u === url)
    const sourceIndex = this.getCancelSourceIndex(url)
    if (requestUrlIndex !== -1 && requestUrlIndex) {
      this.requestUrlList?.splice(requestUrlIndex, 1)
    }
    if (sourceIndex !== -1 && sourceIndex) {
      this.cancelRequestSource?.splice(sourceIndex, 1)
    }
  }

  public cancelAllRequest() {
    this.cancelRequestSource?.forEach(item => {
      const key = Object.keys(item)[0]
      item[key]()
      this.delSource(key)
    })
  }

  // 提供根据url删除当前请求的方式
  public cancelRequest(url: string | string[]) {
    if (typeof url === 'string') {
      // 取消单个请求
      const sourceIndex = this.getCancelSourceIndex(url)
      sourceIndex &&
        sourceIndex >= 0 &&
        this.cancelRequestSource?.[sourceIndex][url]()
    } else {
      // 存在多个需要取消请求的地址
      url.forEach(u => {
        const sourceIndex = this.getCancelSourceIndex(u)
        sourceIndex &&
          sourceIndex >= 0 &&
          this.cancelRequestSource?.[sourceIndex][u]()
      })
    }
  }
}

export default Request
