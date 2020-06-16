import {
  Request
} from '@/api/services/http/request'
const url = {
  userInfo:"/api/common/getUserInfo",
  upload:"api/common/img_upload"
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
        url: UserInfo,
        params
      }
      return await this.service.get(optons)
    } catch (error) {
      console.log(error);
      throw error
    }
  }
  
  // 上传文件
  async uploadFile(data) {
    try {
      const optons = {
        url: Upload,
        data
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
