import Vue from "vue";
import VueRouter from "vue-router";
import layout from "@/components/layout/index.vue";
import container from "@/components/layout/container";
Vue.use(VueRouter);

const routerPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error);
};

const routes = [
  {
    path: "/",
    name: "index",
    component: layout,
    redirect: "/home",
    meta: {
      title: "工作台"
    },
    children: [
      {
        path: "/home",
        name: "home",
        meta: {
          title: "工作台"
        },
        component: () =>
          import(/* webpackChunkName: "Index" */ "@/views/index.vue")
      }
    ]
  },
  {
    path: "/list",
    redirect: "/list",
    component: layout,
    meta: {
      title: "列表"
    },
    children: [
      {
        path: "/list",
        meta: {
          title: "列表"
        },
        component: container,
        children: [
          {
            path: "",
            name: "list",
            component: () =>
              import(
                /* webpackChunkName: "approveList" */ "@/views/depart/department/frameworkList.vue"
              )
          }
        ]
      },
      {
        path: "/list2",
        meta: {
          title: "列表2"
        },
        component: container,
        children: [
          {
            path: "",
            name: "list",
            component: () =>
              import(
                /* webpackChunkName: "approveList" */ "@/views/depart/department/frameworkList.vue"
              )
          }
        ]
      }
    ]
  },
  {
    path: "/depart",
    name: "depart",
    redirect: "/depart",
    component: layout,
    meta: {
      title: "组织架构"
    },
    children: [
      {
        path: "/depart",
        meta: {
          title: "组织架构"
        },
        component: () =>
          import(/* webpackChunkName: "depart" */ "@/views/depart/depart.vue")
      }
    ]
  },
  {
    path: "/setting",
    name: "setting",
    component: layout,
    redirect: "/setting/role",
    meta: {
      title: "系统设置"
    },
    children: [
      {
        path: "/setting/role",
        name: "settingRole",
        meta: {
          title: "角色权限设置"
        },
        component: () =>
          import(/* webpackChunkName: "role" */ "@/views/setting/role.vue")
      },
    ]
  }
];

const router = new VueRouter({
  mode: "hash",
  base: process.env.BASE_URL,
  routes
});
export default router;
