import type { AxiosInstance, AxiosRequestConfig } from "axios";

enum InterceptorEnum {
  Request = 'request',
  Response =  'response'
}

export function handleInterceptor(name: InterceptorEnum,instance:AxiosInstance) {

}