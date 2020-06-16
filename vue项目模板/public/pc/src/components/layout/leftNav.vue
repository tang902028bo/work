<template>
  <ul class="nav-left el-menu">
    <li
      :class="['el-menu-item', item.path == activePath ? 'is-active' : '']"
      v-for="(item, index) in childRoute"
      :key="index"
    >
      <router-link :to="{ path: item.path }">{{ item.meta.title }}</router-link>
    </li>
  </ul>
</template>
<script>
export default {
  name: "LeftNav",
  props: ["childRoute"],
  computed: {
    activePath() {
      return this.$route.matched.length > 2
        ? this.$route.matched[1].path
        : this.$route.path;
    }
  }
};
</script>
<style lang="less" scope>
.nav-left {
  min-height: 629px;
  .el-menu-item {
    text-align: center;
    height: 44px;
    line-height: 44px;
    a {
      text-decoration: none;
      color: #303133;
      display: block;
      height: 100%;
      width: 100%;
    }
    &.is-active {
      background: #ecf5ff;
      color: #0082ef;
      a {
        color: #0082ef;
      }
    }
  }
}
</style>
