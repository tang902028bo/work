<template>
  <div class="main">
    <router-view />
    <div style="height:60px;" />
    <van-tabbar v-model="active" route>
      <van-tabbar-item v-for="(item,index) in navList" :key="index" replace :to="item.path">
        <span>{{ item.title }}</span>
        <template #icon="props">
          <img :src="props.active ? item.active : item.inactive" />
        </template>
      </van-tabbar-item>
    </van-tabbar>
  </div>
</template>
<script>
import { mapGetters } from "vuex";
export default {
  data() {
    return {
      active: 0,
      load: false,
      navList: [
        {
          path: "/page1",
          title: "页面1",
          active: require("@/assets/images/usecar-active.png"),
          inactive: require("@/assets/images/usecar.png"),
          power: 1
        },
        {
          path: "/page2",
          title: "页面2",
          active: require("@/assets/images/approve-active.png"),
          inactive: require("@/assets/images/approve.png"),
          power: 1
        },
        {
          path: "/page3",
          title: "页面3",
          active: require("@/assets/images/car-active.png"),
          inactive: require("@/assets/images/car.png"),
          power: 1
        },
        {
          path: "/page4",
          title: "页面4",
          active: require("@/assets/images/notice-active.png"),
          inactive: require("@/assets/images/notice.png"),
          power: 1
        }
      ]
    };
  },
  computed: {
    ...mapGetters(["userInfo"])
  },
  created() {
    console.log(this.userInfo.is_have_power);
  }
};
</script>
<style lang="less" scoped>
.main {
  height: 100%;
  .van-tabbar-item {
    font-size: 14px;
  }
}
</style>