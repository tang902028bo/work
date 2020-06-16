<template>
  <div class="user-list_box">
    <el-row class="btn">
      <el-col :span="18" class="title">用户列表</el-col>
      <el-col :span="6" class="right-btn">
        <el-button
          type="primary"
          size="medium"
          @click="handleSyncTag"
          :loading="btnOptions.tagsLoading"
        >{{ btnOptions.tagsTxt }}</el-button>
        <el-button
          type="primary"
          size="medium"
          :loading="btnOptions.departLoading"
          @click="handleSyncDepart"
        >{{ btnOptions.departTxt }}</el-button>
      </el-col>
    </el-row>
    <el-row>
      <el-col :span="5">
        已选 {{ selectNumber }} 位用户
        <el-button
          type="primary"
          size="medium"
          :disabled="selectNumber == 0"
          @click="handleEdit('all', selectData)"
        >批量编辑</el-button>
      </el-col>
      <el-col :span="19">
        <el-form :model="searchInfo" :inline="true">
          <el-form-item label="姓名:">
            <el-input size="medium" v-model="searchInfo.name" placeholder="请输入姓名" clearable></el-input>
          </el-form-item>
          <el-form-item label="手机号:">
            <el-input size="medium" v-model="searchInfo.mobile" placeholder="请输入手机号" clearable></el-input>
          </el-form-item>
          <el-form-item label="角色:">
            <el-select
              size="medium"
              v-model="searchInfo.u_roles"
              placeholder="请选择角色"
              class="role"
              clearable
            >
              <el-option
                v-for="item in roleList"
                :key="item.id"
                :label="item.role_name"
                :value="item.id"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button size="medium" type="primary" @click="handleSearch">查询</el-button>
          </el-form-item>
        </el-form>
      </el-col>
    </el-row>
    <el-table
      v-loading="loading"
      element-loading-text="拼命加载中"
      element-loading-spinner="el-icon-loading"
      element-loading-background="rgba(255, 255, 255, 0.6)"
      :header-cell-style="headClass"
      :data="tableData"
      height="410"
      @selection-change="handleSelectionChange"
    >
      <el-table-column type="selection" align="center" width="55"></el-table-column>
      <el-table-column prop="name" label="姓名"></el-table-column>
      <el-table-column label="性别">
        <template slot-scope="scope">
          {{
          scope.row.gender == 0 ? "保密" : scope.row.gender == 1 ? "男" : "女"
          }}
        </template>
      </el-table-column>
      <el-table-column label="头像">
        <template slot-scope="scope">
          <el-popover trigger="hover" placement="top">
            <img :src="scope.row.avatar | formatAvatar(getRootPath)" style="width:100px;" />
            <el-avatar
              shape="square"
              size="small"
              :src="scope.row.avatar | formatAvatar(getRootPath)"
              slot="reference"
            ></el-avatar>
          </el-popover>
        </template>
      </el-table-column>
      <el-table-column prop="mobile" label="手机号"></el-table-column>
      <el-table-column prop="email" label="邮箱"></el-table-column>
      <el-table-column prop="department_name" show-overflow-tooltip label="部门"></el-table-column>
      <el-table-column prop="position" show-overflow-tooltip label="职位"></el-table-column>
      <el-table-column prop="u_role_name" label="角色"></el-table-column>
      <el-table-column label="操作">
        <template slot-scope="scope">
          <el-button type="primary" size="mini" @click="handleEdit('single', scope.row)">编辑</el-button>
        </template>
      </el-table-column>
    </el-table>
    <div class="pagination">
      <el-pagination
        @size-change="handleSizeChange"
        @current-change="handlePageChange"
        background
        :page-sizes="[10, 20, 30]"
        :page-size="pageInfo.limit"
        layout="prev, pager, next, jumper, total, sizes"
        :total="pageInfo.total"
      ></el-pagination>
    </div>
    <edit-info
      :show.sync="editShow"
      :roleList="roleList"
      :data="editData"
      :type="type"
      @update="getUserData"
    ></edit-info>
  </div>
</template>
<script>
import editInfo from "@/views/depart/department/editInfo";
import { depart } from "@/api";
export default {
  props: ["departData"],
  components: {
    editInfo
  },
  data() {
    return {
      searchInfo: {
        name: "",
        mobile: "",
        u_roles: "",
        date: ""
      },
      roleList: [],
      tableData: [],
      loading: true,
      pageInfo: {
        page: 1,
        limit: 10,
        total: 0
      },
      editShow: false,
      editData: "",
      selectNumber: 0,
      type: "",
      selectData: [],
      btnOptions: {
        departLoading: false,
        departTxt: "同步组织架构",
        tagsLoading: false,
        tagsTxt: "同步标签"
      }
    };
  },
  watch: {
    departData(val) {
      this.searchInfo.dep_id = val.id;
      this.getUserData();
    }
  },
  created() {
    this.getUserData();
    this.getRoleData();
  },
  filters: {
    formatAvatar(img, rootPath) {
      let imgUrl = "",
        path = `http://${rootPath.split("/")[2]}`;
      if (img.includes("http") || img.includes("https")) {
        imgUrl = img;
      } else {
        imgUrl = path + img;
      }
      return imgUrl;
    }
  },
  computed: {
    getRootPath() {
      return this.$store.state.common.rootPath;
    },
    headClass() {
      return { background: "#F2F3F5" };
    }
  },
  methods: {
    async getUserData() {
      let search = Object.assign(this.searchInfo, this.pageInfo);
      this.loading = true;
      try {
        const { code, data, msg } = depart.getUserList(search);
        if (code == 1) {
          this.tableData = data;
          this.pageInfo.total = res.total;
        } else {
          this.loading = false;
        }
      } catch {
        this.loading = false;
      }
    },
    async getRoleData() {
      const { code, data, msg } = depart.getRoleList();
      if (code == 1) {
        this.roleList = data;
      }
    },
    handleSearch() {
      this.pageInfo.page = 1;
      this.getUserData();
    },
    handlePageChange(page) {
      this.pageInfo.page = page;
      this.getUserData();
    },
    handleSizeChange(size) {
      this.pageInfo.limit = size;
      this.getUserData();
    },
    handleEdit(type, row) {
      this.editShow = true;
      this.editData = row;
      this.type = type;
    },
    handleSelectionChange(val) {
      this.selectData = val;
      this.selectNumber = val.length;
    },
    async syncData(type) {
      try {
        if (type == "struc") {
          const { code } = depart.syncStrucData();
           this.btnOptions.departLoading = true;
          this.btnOptions.departTxt = "同步组织架构";
        } else {
          const { code } = depart.syncTagData();
          this.btnOptions.tagsLoading = false;
          this.btnOptions.tagsTxt = "同步标签";
        }
        if (code === 1) {
          this.$message.success("同步成功");
          this.$emit("reload");
        } else {
          this.$message.error("同步失败");
        }
        this.getUserData();
      } catch {
        this.$message.error("同步失败");
      }
    },
    // 同步组织架构
    handleSyncDepart() {
      this.$confirm(
        "请确认企业微信后台应用可见范围内，包含您本人，否则同步后您将被禁止登陆，确定同步吗？",
        "同步组织架构",
        {
          confirmButtonText: "确定",
          cancelButtonText: "取消",
          type: "warning"
        }
      )
        .then(() => {
          this.btnOptions.departLoading = true;
          this.btnOptions.departTxt = "同步中...";
          this.syncData("struc");
        })
        .catch(() => {});
    },
    // 同步标签
    handleSyncTag() {
      this.$confirm("确定同步标签吗？", "同步标签", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.btnOptions.tagsLoading = true;
          this.btnOptions.tagsTxt = "同步中...";
          this.syncData("tag");
        })
        .catch(() => {});
    }
  }
};
</script>
<style lang="less" scoped>
.user-list_box {
  padding-left: 10px;
  .role {
    width: 196px;
  }
  .btn {
    margin-bottom: 10px;
  }
  .title {
    line-height: 40px;
    font-size: 16px;
  }
  .el-input {
    width: 180px;
  }
  /deep/.el-table td {
    padding: 5px 0;
  }
  .right-btn {
    text-align: right;
    padding-right: 20px;
    box-sizing: border-box;
  }
}
</style>
