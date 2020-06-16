<template>
  <div class="main-container">
    <el-scrollbar
      :vertical="true"
      class="framework"
      :style="`height:${clientHeight}px;`"
    >
      <top></top>
      <top-nav></top-nav>
      <div class="main-box">
        <el-row v-if="key != 1">
          <el-col :span="3">
            <keep-alive exclude>
              <left-nav
                :childRoute="childRoute"
                v-if="childRoute.length > 0"
              ></left-nav>
            </keep-alive>
          </el-col>
          <el-col :span="21">
            <div class="container page">
              <el-breadcrumb separator-class="el-icon-arrow-right">
                <el-breadcrumb-item
                  v-for="item in levelList"
                  :to="{ path: item.path }"
                  :key="item.path"
                >
                  <span v-if="item.path.includes('number')">{{ carNum }}</span>
                  {{ item.meta.title }}
                </el-breadcrumb-item>
              </el-breadcrumb>
              <el-divider></el-divider>
              <container></container>
            </div>
          </el-col>
        </el-row>
        <router-view v-else></router-view>
      </div>
      <footer>
        联系我们 | 使用文档 | 更新日志 | 隐私政策 | 功能建议 | BUG反馈
        <br />企业微信服务专家: 名冠天下 客服电话:4000282880
      </footer>
    </el-scrollbar>
  </div>
</template>
<script>
import top from "@/components/layout/top";
import topNav from "@/components/layout/topNav";
import leftNav from "@/components/layout/leftNav";
import container from "@/components/layout/container";

export default {
  name: "layout",
  components: {
    top,
    topNav,
    leftNav,
    container
  },
  data() {
    return {
      childRoute: [],
      routers: [],
      levelList: [],
      content: "",
      key: 1,
      carNum: "",
      clientHeight: 0
    };
  },
  watch: {
    $route(to) {
      this.getChlidRoutes(to.matched[0].path);
      this.content = this.$route.name;
      this.key = this.childRoute.length > 1 ? this.childRoute[0].path : 1;
      this.getBreadcrumb();
    }
  },
  created() {
    this.routes = this.$router.options.routes;
    this.content = this.$route.name;
    this.getChlidRoutes(this.$route.matched[0].path);
    this.getBreadcrumb();
    this.key = this.childRoute.length > 1 ? this.childRoute[0].path : 1;
  },
  mounted() {
    // 获取浏览器可视区域高度
    this.clientHeight = `${document.documentElement.clientHeight}`; //document.body.clientWidth;
    //console.log(self.clientHeight);
    window.onresize = function temp() {
      this.clientHeight = `${document.documentElement.clientHeight}`;
    };
  },
  methods: {
    getChlidRoutes(route) {
      let parentRoute = this.routes.filter(item => item.path == route);
      this.childRoute = parentRoute.length > 0 ? parentRoute[0].children : [];
    },
    getBreadcrumb() {
      //$route.matched一个数组 包含当前路由的所有嵌套路径片段的路由记录
      let matched = this.$route.matched.filter(item => item.meta.title);
      this.levelList = matched;
      if (this.$route.params && this.$route.params.number) {
        this.carNum = this.$route.params.number;
      } else {
        this.carNum = "";
      }
    }
  }
};
</script>
<style lang="less" scope>
.main-container {
  display: flex;
  flex-flow: column;
  height: 100%;
  padding-bottom: 30px;
  .is-horizontal {
    display: none;
  }
  .el-scrollbar__view {
    padding-top: 100px;
  }
}
.main-box {
  width: 1280px;
  min-width: 1280px;
  margin: 20px auto;
  background: #fff;
  box-sizing: border-box;
}
.main-box .container {
  background: #fff;
  min-height: 570px;
  /deep/.el-breadcrumb {
    font-size: 16px;
  }
}
.main-box .container.page {
  padding: 24px 15px 15px 15px;
}
.main-box .page-header {
  margin: 10px 0;
}
footer {
  text-align: center;
  color: #b3b3b3;
  width: 100%;
  margin-top: 30px;
  line-height: 30px;
  flex-shrink: 0;
}
</style>
