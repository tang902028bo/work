<template>
  <div v-if="_show" class="pick-car">
    <header ref="container" :container="container">
      <van-sticky>
        <van-search
          v-model="query.search"
          placeholder="搜索名字、类型"
          show-action
          background="#F5F5F5"
          @search="handleSearch"
          @cancel="handleCancel"
        />
      </van-sticky>
    </header>
    <div class="select-box">
      <div class="title">已选车辆</div>
      <div v-if="selectData.length" class="list-box">
        <van-row class="list-box">
          <van-col v-for="item in selectData" :key="item.id" span="8">
            <div class="item" @click="handleCheck('del',item)">
              <div class="name txt-color">{{ item.car_number }}</div>
              <div class="car-info">
                <span>{{ item.type_name }}</span>
                <span class="txt-color">{{ item.seats_number }}座</span>
              </div>
            </div>
          </van-col>
        </van-row>
      </div>
    </div>
    <div class="cars-box">
      <div class="title">在库空闲车辆</div>
      <van-row>
        <van-col span="4" class="tags">车辆类型</van-col>
        <van-col span="20">
          <van-tabs
            line-width="0"
            @change="((name,title)=>{handleTagsChange(name,title,'type_id')})"
          >
            <van-tab v-for="item in typeList" :key="item.id" :title="item.name" :name="item.id" />
          </van-tabs>
        </van-col>
      </van-row>
      <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
        <van-list
          v-model="loading"
          :finished="finished"
          finished-text="没有更多了"
          class="list"
          @load="onLoad"
        >
          <van-row class="list-box">
            <van-col v-for="item in list" :key="item.id" span="8">
              <div class="item" @click="handleCheck('',item)">
                <div class="name txt-color">{{ item.car_number }}</div>
                <div class="car-info">
                  <span>{{ item.type_name }}</span>
                  <span class="txt-color">{{ item.seats_number }}座</span>
                </div>
              </div>
            </van-col>
          </van-row>
        </van-list>
      </van-pull-refresh>
    </div>
    <div class="foot">
      <div>
        已选中
        <span class="num">{{ selectNum }}</span>辆
      </div>
      <div>
        <van-button round type="info" color="#2F7DCD" @click="handleConfirm">确定</van-button>
      </div>
    </div>
  </div>
</template>
<script>
import { carHttpInteractor, typeHttpInteractor } from "@/api";
export default {
  name: "PickerCar",
  props: {
    show: {
      type: Boolean,
      required: true
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      list: [],
      loading: false,
      finished: false,
      refreshing: false,
      query: {
        search: "",
        page: 0,
        pagesize: 40,
        car_status: 0,
        type_id: ""
      },
      count: 0,
      container: null,
      selectData: [],
      typeList: [],
      title: ""
    };
  },
  computed: {
    _show: {
      get: function() {
        return this.show;
      },
      set: function(val) {
        this.query.search = "";
        this.query.type_id = "";
        this.handleSearch();
        this.$emit("update:show", val);
      }
    },
    selectNum() {
      return this.selectData.length;
    }
  },
  watch: {
    _show(val) {
      if (val) {
        this.selectData = this.data;
        this.list = [...this.list].filter(item =>
          [...this.selectData].every(selItem => item.id !== selItem.id)
        );
      }
    }
  },
  mounted() {
    this.container = this.$refs.container;
  },
  methods: {
    onLoad() {
      this.getTypeData();
      this.getCarData();
      if (this.refreshing) {
        this.query.page = 1;
        this.list = [];
        this.refreshing = false;
      } else {
        this.query.page++;
      }
    },
    async getCarData() {
      try {
        const {
          code,
          data: { list, count }
        } = await carHttpInteractor.getList(this.query);
        if (code == 200) {
          this.count = count;
          this.loading = false;
          this.skeShow = false;
          if (this.query.page === 1) {
            this.list = list;
          } else {
            this.list = [...this.list, ...list];
          }
          if (this.list.length >= this.count) {
            this.finished = true;
          }
        } else {
          this.finished = true;
        }
      } catch {
        this.finished = true;
      }
    },
    async getTypeData() {
      try {
        const { data } = await typeHttpInteractor.getList();
        this.typeList = data;
        this.typeList.unshift({ id: "", name: "全部" });
      } catch (error) {
        console.log(error);
      }
    },
    handleConfirm() {
      if (this.selectNum > 0) {
        this._show = false;
        this.$emit("done", this.selectData);
        this.query.search = "";
        this.handleSearch();
      } else {
        this.$notify({ type: "danger", message: "请选择车辆", duration: 1000 });
      }
    },
    handleSearch() {
      this.refreshing = true;
      this.loading = true;
      this.onLoad();
    },
    handleTagsChange(name, title, type) {
      this.query[type] = name;
      this.title = title;
      this.handleSearch();
    },
    handleCheck(type, val) {
      if (type == "del") {
        this.list.push(val);
        this.selectData = this.selectData.filter(item => item.id != val.id);
      } else {
        this.selectData.push(val);
        this.list = this.list.filter(item => item.id != val.id);
      }
    },
    handleCancel() {
      this._show = false;
    },
    onRefresh() {
      // 清空列表数据
      this.finished = false;

      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      this.loading = true;
      this.onLoad();
    }
  }
};
</script>
<style lang="less" scoped>
.pick-car {
  position: fixed;
  height: 100%;
  width: 100%;
  background: #fff;
  overflow: auto;
  top: 0;
  left: 0;
  z-index: 99999;
  .list,
  .van-pull-refresh {
    min-height: 500px;
  }
  .van-search {
    background: #fff;
    .van-search__content {
      border: 1px solid #d7dade;
    }
  }
  .tags {
    line-height: 44px;
    text-align: center;
    font-size: 12px;
  }
  .title {
    font-size: 18px;
    line-height: 50px;
    padding: 0 10px;
    box-sizing: border-box;
  }
  /deep/.van-tabs {
    .van-tab--active {
      display: flex;
      align-items: center;
      .van-tab__text {
        background: #cce3fb;
        color: #0082ef;
        text-align: center;
        width: 100px;
        max-width: 100%;
        height: 30px;
        line-height: 30px;
        display: block;
        box-sizing: border-box;
        border-radius: 4px;
        &:first-child {
          max-width: 80px;
        }
      }
    }
    .van-tab__text {
      font-size: 12px;
    }
  }
  .select-box {
    min-height: 160px;
  }
  .list-box {
    box-sizing: border-box;
    padding: 0 10px;
    .van-col {
      padding: 0 4px;
    }
    .item {
      border: 1px solid rgba(0, 130, 239, 0.4);
      border-radius: 2px;
      padding: 5px 10px;
      margin: 5px 0;
      .txt-color {
        color: #0082ef;
      }
      .name {
        font-size: 16px;
        font-weight: bold;
        margin-bottom: 10px;
      }
      .car-info {
        display: flex;
        justify-content: space-between;
      }
    }
  }
  .foot {
    position: fixed;
    display: flex;
    justify-content: space-between;
    align-items: center;
    line-height: 40px;
    background: #fff;
    padding: 4px 10px;
    box-sizing: border-box;
    width: 100%;
    bottom: 0;
    box-shadow: 1px 0 6px 1px rgba(0, 0, 0, 0.1);
    .num {
      margin: 0 4px;
      font-size: 14px;
      color: red;
    }
    button {
      width: 100px;
      color: #000;
    }
  }
}
</style>