import Vue from "vue";
import Router from 'vue-router';
import store from '@/store';
import {
  Dialog
} from "vant";
Vue.use(Router);

const router = new Router({
  mode: "hash",
  base: process.env.BASE_URL,
  routes: [{
      path: "/",
      redirect: "/index"
    },
    {
      path: "/use/info/:id/:status",
      name: "useCarInfo",
      meta: {
        title: "详情页面"
      },
      hide: true,
      component: () =>
        import(
          /* webpackChunkName: "useCar" */
          "@/views/useCar/info.vue"
        )
    },
    {
      path: "/use/add",
      name: "useCarAdd",
      meta: {
        title: "添加页面"
      },
      hide: true,
      component: () =>
        import(
          /* webpackChunkName: "useCar" */
          "@/views/useCar/add.vue"
        )
    },
    {
      path: "/use/edit/:id",
      name: "useCarEdit",
      meta: {
        title: "编辑页面"
      },
      hide: true,
      component: () =>
        import(
          /* webpackChunkName: "useCar" */
          "@/views/useCar/add.vue"
        )
    },
    {
      path: "/index",
      name: "index",
      redirect: '/page1',
      component: () => import("@/views/index.vue"),
      children: [{
          path: "/page1",
          name: "page1",
          meta: {
            title: "用车"
          },
          component: () => import( /* webpackChunkName: "index" */ "@/views/useCar/index.vue"),
        },
        {
          path: "/page2",
          name: "page2",
          meta: {
            title: "用车"
          },
          component: () => import( /* webpackChunkName: "index" */ "@/views/useCar/index.vue"),
        },
        {
          path: "/page3",
          name: "page3",
          meta: {
            title: "用车"
          },
          component: () => import( /* webpackChunkName: "index" */ "@/views/useCar/index.vue"),
        },
        {
          path: "/page4",
          name: "page4",
          meta: {
            title: "用车"
          },
          component: () => import( /* webpackChunkName: "index" */ "@/views/useCar/index.vue"),
        },
      ]
    }
  ]
})

// 获取用户权限
const {
  is_have_power
} = store.state.user.userInfo;
router.beforeEach((to, from, next) => {
  // 关闭提示 loading动画
  if (to.meta.keepAlive === false) {
    // 页面没缓存 滚动到页面顶部
    let vue = new Vue();
    vue.$nextTick(() => {
      document.documentElement.scrollTop = document.body.scrollTop = 0;
    });
  }
  document.title = to.meta.title || "用车";
  if (to.meta.requireAuth && !is_have_power) {
    Dialog.alert({
        title: "提示",
        message: "暂无权限访问该页面，请联系管理员设置权限",
        confirmButtonColor: "#467db9",
        confirmButtonText: "返回首页"
      })
      .then(() => {
        next("/use");
      })
  } else {
    next();
  }

});

export default router;
