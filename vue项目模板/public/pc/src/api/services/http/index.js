import axios from 'axios'
// import store from '@/store'
import { Message } from "element-ui";
// import { getToken } from '../cache'
import RESTFUL_ERROR_CODE_MAP from './restful_error_code'
import qs from "qs";
import NProgress from 'nprogress' // progress bar
import 'nprogress/nprogress.css' // progress bar style
NProgress.configure({
  showSpinner: false
});

function errorReport(url, error, requestOptions, response) {
  if (window.$sentry) {
    const errorInfo = {
      error: typeof error === 'string' ? new Error(error) : error,
      type: 'request',
      requestUrl: url,
      requestOptions: JSON.stringify(requestOptions)
    }

    if (response) {
      errorInfo.response = JSON.stringify(response)
    }

    window.$sentry.log(errorInfo)
  }
}

const DEFAULT_OPTIONS = {
  baseURL: process.env.VUE_APP_BASE_API,
  timeout: 30000,
  headers: {
    timestamp: new Date().getTime(),
    'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8',
    'Account': process.env.NODE_ENV === 'development' ? "XiaoHuaHua": "",
  }
}
 
const responseLog = (response) => {
  if (process.env.NODE_ENV === 'development') {
    const randomColor = `rgba(${Math.round(Math.random() * 255)},${Math.round(
      Math.random() * 255
    )},${Math.round(Math.random() * 255)})`
    console.log(
      '%c┍------------------------------------------------------------------┑',
      `color:${randomColor};`
    )
    console.log('| 请求地址：', response.config.url)
    console.log('| 请求参数：', response.config.data ? qs.parse(response.config.data) : {})
    console.log('| 返回数据：', response.data)
    console.log(
      '%c┕------------------------------------------------------------------┙',
      `color:${randomColor};`
    )
  }
}

const instance = axios.create(DEFAULT_OPTIONS)

instance.interceptors.request.use(
  (config) => {
    NProgress.start() // start progress bar
    return config
  },
  (error) => {
    Promise.reject(error)
  }
)

instance.interceptors.response.use(
  (response) => {
    responseLog(response)
    NProgress.done();
    const code = response.data.code
    const msg = RESTFUL_ERROR_CODE_MAP[code];
    if (msg) {
      if (code === 403) {
        window.location.href = "";
      } else {
        Message({
          message: response.data.message || msg,
          type: 'error'
        })
        if (code === 401) {
          Dialog.confirm({
            message: response.data.message || msg
          }).then(() => {
            // store.dispatch('user/resetToken').then(() => {
            //   location.reload()
            // })
          })
        }
      }
      return Promise.reject(new Error(response.data.message || msg))
    } else {
      return response
    }
  },
  (thrown) => {
    NProgress.done();
    let code = thrown.message.replace(/[^0-9]/ig, "");
    Message({
      message: RESTFUL_ERROR_CODE_MAP[code] || '服务器发生错误',
      type: 'error'
    })
    return Promise.reject(thrown)
  }
)

export default async function (options) {
  const {
    url
  } = options
  const requestOptions = Object.assign({}, options)
  try {
    const {
      data,
      data: {
        errno,
        errmsg
      }
    } = await instance.request(requestOptions)
    if (errno) {
      errorReport(url, errmsg, requestOptions, data)
      throw new Error(errmsg)
    }
    return data
  } catch (err) {
    errorReport(url, err, requestOptions)
    throw err
  }
}
