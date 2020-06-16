<template>
  <div class="permission-box">
    <h3>{{ role.role_name }} 设置</h3>
    <div class="nav-title">操作权限</div>
    <div class="box">
      <div v-for="(item, index) in permission" :key="index" class="item-box">
        <div class="title">{{ item.name }} 设置</div>
        <div class="permission">
          <div class="item">
            <el-checkbox
              v-for="(perItem, perIndex) in item.children"
              v-model="perItem.checked"
              :disabled="role.is_system ? true : false"
              :label="perItem.id"
              :key="perIndex"
              @change="handleSetRoles(perItem)"
            >{{ perItem.name }}</el-checkbox>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { depart } from "@/api";
export default {
  props: ["role"],
  data() {
    return {
      permission: [],
      permissionList: [],
      type: {
        1: "组织架构",
        2: "角色管理",
        3: "司机管理",
        4: "车辆管理",
        6: "车辆类型管理",
        7: "用车管理",
        8: "用车审批",
        9: "数据统计"
      },
      checkedList: []
    };
  },
  watch: {
    role(val) {
      this.changeRoleData(val);
    }
  },
  created() {
    this.getPermissionShow();
  },
  methods: {
    async getPermissionShow() {
      const { code, msg } = await depart.getPermission();
      if (code == 1) {
        this.permissionList = res.data;
        this.permission = this.covertData(res.data);
        this.changeRoleData(this.role);
      }
    },
    async getPermission() {
      if (
        this.role.id === "" ||
        this.role.id === undefined ||
        this.role.id === null
      ) {
        return false;
      }
      const { code, data, msg } = await depart.getPermission({
        role_id: this.role.id
      });
      if (code == 1) {
        let checkData = [];
        this.permissionList.forEach(item => {
          for (let i in data) {
            if (item.id === data[i].id) {
              item.checked = data[i].status ? true : false;
              checkData.push(item);
              return false;
            }
          }
          checkData.push(item);
        });
        this.permission = this.covertData(checkData);
      }
    },
    changeRoleData(val) {
      if (val.is_system) {
        this.permission.forEach(item => {
          item.children.forEach(childItem => {
            childItem.checked = true;
          });
        });
      } else {
        this.permission.forEach(item => {
          item.children.forEach(childItem => {
            childItem.checked = false;
          });
        });
        this.getPermission();
      }
    },
    covertData(list) {
      let types = this.type;
      let permissionData = [];
      Object.keys(types).forEach(key => {
        let permissionItem = {};
        permissionItem.name = types[key];
        let children = [];
        list.forEach(item => {
          if (item.type == key) {
            if (this.role.is_system) {
              item.checked = false;
            } else {
              item.checked = item.checked ? item.checked : false;
            }
            children.push(item);
          }
        });
        permissionItem.children = children;
        permissionData.push(permissionItem);
      });
      return permissionData;
    },
    async handleSetRoles(item) {
      this.$forceUpdate();
      let postData = {
        role_id: this.role.id,
        code: item.code,
        type: item.type,
        status: item.checked ? 1 : 0
      };
      const { code } = await depart.setPermission(postData);
    }
  }
};
</script>
<style lang="less" scoped>
.permission-box {
  box-sizing: border-box;
  padding: 0 20px;
  .nav-title {
    padding: 0 11px;
    line-height: 55px;
    border-bottom: 1px solid #e5e5e5;
  }
  .title {
    position: relative;
    height: 42px;
    line-height: 42px;
    padding: 0 15px 0 35px;
    color: #333;
    background-color: #f2f2f2;
    cursor: pointer;
    font-size: 14px;
    overflow: hidden;
  }
  h3 {
    font-weight: normal;
    font-size: 18px;
  }
  .box {
    padding: 10px;
    .item-box {
      margin-bottom: 20px;
      border: 1px solid #ececec;
      box-shadow: 0 1px 1px rgba(0, 0, 0, 0.05);
      border-radius: 2px;
      .permission {
        padding: 20px 35px;
        line-height: 35px;
        display: flex;
        .item {
          padding-left: 28px;
        }
      }
    }
  }
}
</style>
