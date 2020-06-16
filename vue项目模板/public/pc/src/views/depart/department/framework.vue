<template>
  <el-scrollbar :vertical="true" class="framework" style="height:600px;">
    <div class="title">公司组织架构</div>
    <el-tree
      :data="data"
      :props="defaultProps"
      :default-expand-all="true"
      :expand-on-click-node="false"
      :check-on-click-node="true"
      @check="handleDepartClick"
    >
      <span class="custom-tree-node" slot-scope="{ node, data }">
        <span>
          <i :class="data.isuser ? 'el-icon-user' : 'el-icon-folder'"></i>
          {{ node.label }}
        </span>
      </span>
    </el-tree>
  </el-scrollbar>
</template>
<script>
import { depart } from "@/api";
export default {
  props: ["reload"],
  data() {
    return {
      data: [],
      defaultProps: {
        children: "children",
        label: "dep_name"
      }
    };
  },
  watch: {
    reload(val) {
      if (val) {
        this.getDepartData();
      }
    }
  },
  computed: {
    _reload: {
      get() {
        return this.reload;
      },
      set() {
        this.$emit("update:reload", false);
      }
    }
  },
  created() {
    this.getDepartData();
  },
  methods: {
    async getDepartData() {
      try {
        const { code, data } = await depart.getDepartList();
        if (code == 1) {
          this.data = this.buildTree(data);
          this._reload = false;
        }
      } catch{
        this._reload = false;
      }
    },
    buildTree(list) {
      let temp = {};
      let tree = [];
      for (let i in list) {
        temp[list[i].id] = list[i];
      }
      for (let i in temp) {
        if (temp[i].parentid) {
          if (!temp[temp[i].parentid].children) {
            temp[temp[i].parentid].children = new Array();
          }
          temp[temp[i].parentid].children.push(temp[i]);
        } else {
          tree.push(temp[i]);
        }
      }
      return tree;
    },
    //   点击节点
    handleDepartClick(data) {
      this.$emit("changeDepart", data);
    }
  }
};
</script>
<style lang="less" scoped>
.title {
  line-height: 40px;
  font-size: 14px;
}
.framework {
  .el-tree {
    font-size: 14px;
  }
  .is-horizontal {
    display: none;
  }
  /deep/.el-scrollbar__wrap {
    overflow-x: hidden;
    .el-scrollbar__view {
      padding: 0;
    }
  }
}
</style>
