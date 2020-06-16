<template>
  <div class="role-box">
    <h3>
      <el-row>
        <el-col :span="16">公司角色</el-col>
        <el-col :span="8">
          <div class="add" @click="roleFormShow = true">
            <i class="el-icon-plus"></i>新增
          </div>
        </el-col>
      </el-row>
    </h3>
    <el-row
      v-for="(item, index) in roleList"
      :key="index"
      :class="['item', selectRoleId == item.id ? 'active' : '']"
      @click.native="handleSelectRole(item)"
    >
      <el-col :span="16">{{ item.role_name }}</el-col>
      <el-col :span="8">
        <template v-if="item.is_system">
          <span class="color-info">系统默认</span>
        </template>
        <template v-else>
          <el-tooltip placement="bottom" content="编辑">
            <i class="el-icon-edit" @click="handleEdit(item)"></i>
          </el-tooltip>
          <el-tooltip placement="bottom" content="删除">
            <i class="el-icon-delete" @click="handleDel(item.id)"></i>
          </el-tooltip>
        </template>
      </el-col>
    </el-row>
    <el-dialog :title="form.id ? '编辑' : '新增'" :visible.sync="roleFormShow">
      <el-form :model="form" ref="form" label-width="80px">
        <el-form-item
          label="名字"
          prop="name"
          :rules="[
            { required: true, message: '请输入角色名字', trigger: 'blur' }
          ]"
        >
          <el-input v-model="form.name" placeholder="请输入角色名字"></el-input>
        </el-form-item>
        <el-form-item slot="footer" class="dialog-footer"></el-form-item>
      </el-form>
      <div slot="footer" class="dialog-footer">
        <el-button size="mini" @click="roleFormShow = false">取消</el-button>
        <el-button size="mini" type="primary" @click="saveData('form')">确定</el-button>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import { depart } from "@/api";
export default {
  data() {
    return {
      roleList: [],
      selectRoleId: "",
      form: {
        id: "",
        name: ""
      },
      roleFormShow: false
    };
  },
  created() {
    this.getRoleData();
  },
  methods: {
    async getRoleData() {
      const { code, msg } = await depart.getRoleList();
      if (code === 1) {
        this.roleList = data;
        this.handleSelectRole(this.roleList[0]);
      }
    },
    handleEdit(data) {
      this.form.id = data.id;
      this.form.name = data.role_name;
      this.roleFormShow = true;
    },
    handleSelectRole(data) {
      this.selectRoleId = data.id;
      this.$emit("setRole", data);
    },
    handleDel(id) {
      this.$confirm("是否删除该角色", "提升", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.$axios
            .post("/admin/role/del_role", { id: id })
            .then(res => {
              if (res.code == 1) {
                this.$message.success("删除成功");
                this.getRoleData();
              }
            })
            .catch(err => {
              console.log(err);
            });
        })
        .catch(() => {});
    },
    saveData(form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.$axios.post("/admin/role/edit_role", this.form).then(res => {
            if (res.code) {
              this.form.id = "";
              this.form.name = "";
              this.roleFormShow = false;
              this.getRoleData();
              this.$message.success(res.msg);
            } else {
              this.$message.error(res.msg);
            }
          });
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.role-box {
  h3 {
    border-bottom: 1px solid #e8e8e8;
    line-height: 40px;
    margin-bottom: 10px;
    .add {
      cursor: pointer;
    }
  }
  .item {
    cursor: pointer;
    line-height: 40px;
    font-size: 14px;
    &.active {
      color: #04a9fe;
    }
    &:hover {
      outline: 0;
      background-color: #ecf5ff;
    }
    i {
      font-size: 16px;
      margin-left: 10px;
    }
  }
}
</style>
