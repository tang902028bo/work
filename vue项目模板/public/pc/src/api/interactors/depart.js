import {
  Request
} from '@/api/services/http/request'

const url = {
  departList:"/structure/Query/depList",
  userList:"/structure/Query/userList",
  roleList:"/admin/role/role_list",
  permission:"/admin/role/show_role_permission",
  setPermission:"/admin/role/change_operation_permission",
  setRole:"/admin/role/set_role",
  syncStruc:"/structure/api/sync",
  syncTag:"/structure/api/synchronization_wxwork_tags",
}

class Depart {
  service
  constructor(service) {
    this.service = service
  }
  
  // 获取部门
  async getDepartList() {
    try {
      const optons = {
        url: url.departList
      }
      return await this.service.get(optons)
    } catch (error) {
      throw error
    }
  }
  // 根据部门获取用户
  async getUserList(params) {
    try {
      const optons = {
        url: url.userList,
        params
      }
      return await this.service.get(optons)
    } catch (error) {
      throw error
    }
  }
  // 根据部门获取用户
  async getRoleList(params) {
    try {
      const optons = {
        url: url.roleList,
        params
      }
      return await this.service.get(optons)
    } catch (error) {
      throw error
    }
  }
  // 根据角色获取权限
  async getPermission(params) {
    try {
      const optons = {
        url: url.permission,
        params
      }
      return await this.service.get(optons)
    } catch (error) {
      throw error
    }
  }
  //设置权限
  async setPermission(data) {
    try {
      const optons = {
        url: url.setPermission,
        data
      }
      return await this.service.post(optons)
    } catch (error) {
      throw error
    }
  }
  // 设置角色
  async setRole(data) {
    try {
      const optons = {
        url: url.setRole,
        data
      }
      return await this.service.post(optons)
    } catch (error) {
      throw error
    }
  }
  // 同步组织架构
  async syncStrucData(params) {
    try {
      const optons = {
        url: url.syncStruc,
        params
      }
      return await this.service.get(optons)
    } catch (error) {
      throw error
    }
  }
  // 同步标签
  async syncTagData(params) {
    try {
      const optons = {
        url: url.syncTag,
        params
      }
      return await this.service.get(optons)
    } catch (error) {
      throw error
    }
  }
}

const depart = new Depart(Request.getInstance())
export default depart
