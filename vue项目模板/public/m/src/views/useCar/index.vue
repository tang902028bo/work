<template>
  <div class="use-boxs">
    <van-sticky>
      <van-tabs
        v-model="active"
        :title-active-color="options.activeColor"
        :color="options.color"
        sticky
        replace
      >
        <van-tab
          v-for="(item,index) in tabList"
          :key="index"
          :title="item.title"
        />
      </van-tabs>
    </van-sticky>
    <list
      :status="tabList[active].status"
      :active="active"
    />
    <van-button
      type="info"
      class="add"
      @click="$router.push(`/use/add`)"
    >
      <van-icon name="plus" />
    </van-button>
  </div>
</template>
<script>
import list from "@/views/useCar/list";
export default {
  components: {
    list
  },
  data() {
    return {
      active: 0,
      tabList: [
        { status: "1", title: "待处理" },
        { status: "2", title: "已处理" },
        { status: "3", title: "用车中" },
        { status: "4", title: "用车结束" }
      ],
      options: {
        activeColor: "#467DB9",
        color: "#0082EF"
      }
    };
  }
};
</script>
<style lang="less" scoped>
.use-boxs {
  .add {
    position: fixed;
    border-radius: 50%;
    right: 20px;
    bottom: 60px;
    width: 50px;
    height: 50px;
    display: block;
    box-sizing: border-box;
    font-size: 40px;
    padding: 0;
    margin: 0;
    span {
      display: block;
      height: 50px;
      width: 50px;
      line-height: 56px;
      text-align: center;
      position: relative;
      top: 2px;
      left: -1px;
    }
  }
}
</style>