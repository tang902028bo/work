<template>
  <el-row class="depart-box">
    <div class="title">部门和用户设置</div>
    <el-col :span="4" class="left-box">
      <framework
        @changeDepart="handlDepartChange"
        :reload.sync="reload"
      ></framework>
    </el-col>
    <el-col :span="20">
      <framework-list
        :departData="departData"
        @reload="reloadData"
      ></framework-list>
    </el-col>
  </el-row>
</template>
<script>
import framework from "@/views/depart/department/framework";
import frameworkList from "@/views/depart/department/frameworkList";
export default {
  data() {
    return {
      departData: "",
      reload: false
    };
  },
  components: {
    framework,
    frameworkList
  },
  methods: {
    handlDepartChange(data) {
      this.departData = data;
    },
    reloadData() {
      this.reload = true;
    }
  }
};
</script>
<style lang="less" scoped>
.depart-box {
  background: #fff;
  padding: 20px 10px;
  .title {
    font-size: 16px;
    margin-bottom: 10px;
  }
  .left-box {
    border-right: 1px solid #dbdbdb;
  }
}
</style>
