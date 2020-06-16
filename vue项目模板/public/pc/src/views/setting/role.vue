<template>
  <el-row>
    <el-col :span="4">
      <role-list @setRole="setRole"></role-list>
    </el-col>
    <el-col :span="20">
      <permission :role="roleData"></permission>
    </el-col>
  </el-row>
</template>
<script>
import roleList from "@/views/setting/role/roleList";
import permission from "@/views/setting/role/permission";

export default {
  components: {
    roleList,
    permission
  },
  data() {
    return {
      roleData: {}
    };
  },
  methods: {
    setRole(data) {
      this.roleData = data;
    }
  }
};
</script>
