import {
  Request
} from '@/api/services/http/request'

const url = {
  userInfo:"/admin/index/get_userinfo",
  loginOut:"/structure/login/logout",
}

class Common {
  service
  constructor(service) {
    this.service = service
  }
  
  // 获取当前用户信息
  async getUserInfo(params) {
    try {
      const optons = {
        url: url.userInfo,
        params
      }
      return await this.service.get(optons)
    } catch (error) {
      console.log(error);
      throw error
    }
  }

  // 退出登录
  async loginOut() {
    try {
      const optons = {
        url: url.loginOut,
      }
      return await this.service.post(optons)
    } catch (error) {
      console.log(error);
      throw error
    }
  }
}

const common = new Common(Request.getInstance())
export default common
