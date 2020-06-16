<template>
  <nav>
    <el-menu
      :default-active="activeIndex"
      router
      class="nav-item"
      mode="horizontal"
      active-text-color="#0082EF"
    >
      <el-menu-item
        :index="item.path"
        v-for="(item, index) in routes"
        :key="index"
      >
        <span slot="title">{{ item.meta.title }}</span>
      </el-menu-item>
    </el-menu>
  </nav>
</template>
<script>
export default {
  name: "topNav",
  data() {
    return {
      routes: []
    };
  },
  computed: {
    activeIndex() {
      return this.$route.matched[0].path ? this.$route.matched[0].path : "/";
    }
  },
  created() {
    this.routes = this.$router.options.routes;
  }
};
</script>
<style lang="less" scope>
nav {
  background: #fff;
  min-width: 1280px;
  position: fixed;
  top: 40px;
  width: 100%;
  z-index: 66;
  box-shadow: 0 0 3px 0px rgba(0, 0, 0, 0.05);
  border-bottom: 1px solid #f2f2f2;
  .nav-item {
    margin: 0 auto;
    width: 1280px;
  }
  .nav-item .el-menu-item {
    margin: 0 20px;
    height: 60px;
    line-height: 60px;
    font-size: 16px;
  }
  .el-menu--horizontal > .el-menu-item.is-active {
    border-bottom: 2px solid #0082ef;
  }
  .el-menu.el-menu--horizontal {
    border: none;
  }
}
</style>
