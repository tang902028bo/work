<template>
  <el-dialog title="编辑信息" :visible.sync="editShow" width="550px" class="pickUserBox">
    <el-form
      :model="formData"
      :rules="rules"
      v-loading="loading"
      label-width="80px"
      ref="editForm"
      class="editForm"
    >
      <el-form-item label="姓名" v-if="type == 'single'">
        <el-input v-model="formData.name" disabled></el-input>
      </el-form-item>
      <el-form-item label="角色" prop="role_id">
        <el-select v-model="formData.role_id" placeholder="请选择角色">
          <el-option
            v-for="(item, index) in roleList"
            :key="index"
            :label="item.role_name"
            :value="item.id"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="入职时间" v-if="type == 'single'">
        <el-date-picker
          type="date"
          placeholder="选择日期"
          v-model="formData.entry_date"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>
      <el-form-item label="转正时间" v-if="type == 'single'">
        <el-date-picker
          type="date"
          placeholder="选择日期"
          v-model="formData.formal_date"
          value-format="yyyy-MM-dd"
        ></el-date-picker>
      </el-form-item>
      <el-form-item>
        <el-button size="mini" @click="editShow = false">取消</el-button>
        <el-button type="primary" size="mini" @click="saveData('editForm')">确定</el-button>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>
<script>
import { depart } from "@/api";
export default {
  props: ["show", "roleList", "data", "type"],
  data() {
    return {
      loading: true,
      formData: {
        id: "",
        name: "",
        role_id: "",
        entry_date: "",
        formal_date: ""
      },
      rules: {
        role_id: [{ required: true, message: "请选择角色", trigger: "blur" }]
      }
    };
  },
  watch: {
    data() {
      this.setData();
    }
  },
  created() {
    setTimeout(() => {
      if (this.data) this.setData();
      this.loading = false;
    }, 1000);
  },
  computed: {
    editShow: {
      get: function() {
        return this.show;
      },
      set: function(val) {
        this.$emit("update:show", val);
      }
    }
  },
  methods: {
    setData() {
      if (this.type === "single") {
        this.formData.id = this.data.id;
        this.formData.name = this.data.name;
        this.formData.role_id =
          Number(this.data.u_roles) > 0 ? Number(this.data.u_roles) : "";
        this.formData.entry_date = this.data.entry_date
          ? new Date(this.data.entry_date)
          : "";
        this.formData.formal_date = this.data.formal_date
          ? new Date(this.data.formal_date)
          : "";
      } else {
        let postData = {
          id: this.data.map(item => item.id).join(","),
          role_id: ""
        };
        this.formData = postData;
      }
    },
    async setRole() {
      try {
        const { code, msg } = depart.setRole(this.formData);
        if (code == 200) {
          this.$message.success(res.msg);
          this.editShow = false;
          this.$emit("update");
        }
      } catch {}
    },
    saveData(form) {
      this.$refs[form].validate(valid => {
        if (valid) {
          this.setRole();
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.editForm {
  width: 70%;
  margin-left: 10%;
  .el-select,
  .el-date-editor.el-input {
    width: 100%;
  }
  .el-button {
    margin-left: 40px;
  }
}
</style>
