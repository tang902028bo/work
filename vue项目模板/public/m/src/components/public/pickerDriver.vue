<template>
  <div v-if="_show" class="pick-driver">
    <header ref="container" :container="container">
      <van-sticky>
        <van-search
          v-model="query.search"
          placeholder="搜索名字/手机号"
          show-action
          background="#F5F5F5"
          @search="handleSearch"
          @cancel="handleCancel"
        />
      </van-sticky>
    </header>
    <van-pull-refresh v-model="refreshing" @refresh="onRefresh">
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        class="list"
        @load="onLoad"
      >
        <van-radio-group v-if="single" v-model="checkSingleData">
          <van-cell-group>
            <van-cell v-for="(item, index) in list" :key="index" v-show="item.show">
              <template #title>
                {{ item.realname }}
                <van-tag v-if="item.status==0" plain type="success">空闲</van-tag>
                <van-tag v-else plain type="danger">出车中</van-tag>
                <a class="tel" :href="`tel:${item.mobile}`">
                  <van-icon name="phone-o" />
                  {{ item.mobile }}
                </a>
              </template>
              <template v-if="item.status==0" #right-icon>
                <van-radio :name="item" checked-color="#467DB9" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-radio-group>
        <van-checkbox-group v-else v-model="checkMultiData">
          <van-cell-group>
            <van-cell v-for="(item, index) in list" :key="index" v-show="item.show">
              <template #title>
                {{ item.realname }}
                <van-tag v-if="item.status==0" plain type="success">空闲</van-tag>
                <van-tag v-else plain type="danger">出车中</van-tag>
                <a class="tel" :href="`tel:${item.mobile}`">
                  <van-icon name="phone-o" />
                  {{ item.mobile }}
                </a>
              </template>
              <template v-if="item.status==0" #right-icon>
                <van-checkbox :name="item" shape="square" checked-color="#467DB9" />
              </template>
            </van-cell>
          </van-cell-group>
        </van-checkbox-group>
      </van-list>
    </van-pull-refresh>
    <div class="foot">
      <div>
        已选中
        <span class="num">{{ selectNum }}</span>人
      </div>
      <div>
        <van-button round type="info" color="#2F7DCD" @click="handleConfirm">确定</van-button>
      </div>
    </div>
  </div>
</template>
<script>
import { publicHttpInteractor } from "@/api";
export default {
  name: "PickerDriver",
  props: {
    show: {
      type: Boolean,
      required: true
    },
    single: {
      type: Boolean,
      default: true
    },
    data: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      list: [],
      checkSingleData: "", //单选值
      checkMultiData: [], //多选值
      loading: false,
      finished: false,
      refreshing: false,
      query: {
        search: "",
        page: 0,
        pagesize: 30
        // status: 0
      },
      count: 0,
      container: null
    };
  },
  computed: {
    _show: {
      get: function() {
        return this.show;
      },
      set: function(val) {
        this.$emit("update:show", val);
      }
    },
    selectNum() {
      if (this.single) {
        return this.checkSingleData ? 1 : 0;
      } else {
        return this.checkMultiData.length;
      }
    }
  },
  watch: {
    _show(val) {
      if (val) {
        this.multipleSelectionAll = [];
        this.setCheckData();
        this.finished = false;
        this.query.search = "";
        this.handleSearch();
      }
    }
  },
  mounted() {
    this.container = this.$refs.container;
  },
  methods: {
    setCheckData() {
      let list = this.list;
      this.multipleSelection = [];
      if (this.data.length > 0) {
        if (this.single) {
          this.checkSingleData = list.filter(
            item => item.id == this.data[0].id
          )[0];
        } else {
          this.data.forEach(item => {
            this.multipleSelection.push(
              list.filter(listItem => listItem.id == item.id)[0]
            );
          });
          this.multipleSelectionAll = this.multipleSelection;
        }
      }
    },
    onLoad() {
      this.getDriverData();
      if (this.refreshing) {
        this.query.page = 1;
        this.list = [];
        this.refreshing = false;
      } else {
        this.query.page++;
      }
    },
    async getDriverData() {
      try {
        let {
          code,
          data: { list, count }
        } = await publicHttpInteractor.getDriver(this.query);
        if (code === 200) {
          this.list = list;
          this.count = count;
          if (this.query.page === 1) {
            this.list = list;
          } else {
            this.list = [...this.list, ...list];
          }
          if (list.length <= this.query.pagesize) {
            this.finished = true;
          }
          this.list = this.converData(this.list);
        } else {
          this.finished = true;
        }
        this.list.forEach(item => {
          item.show = true;
        });
      } catch {
        this.finished = true;
      }
    },
    converData(data) {
      let emptyData = [],
        outData = [];
      data.forEach(item => {
        if (item.status == 0) {
          emptyData.push(item);
        } else {
          outData.push(item);
        }
      });
      return [...emptyData, ...outData];
    },
    handleConfirm() {
      let selectData = [];
      if (this.selectNum > 0) {
        if (this.single) {
          selectData = this.checkSingleData;
        } else {
          selectData = this.checkMultiData;
        }
        this._show = false;
        this.$emit("done", selectData);
      } else {
        this.$notify({ type: "danger", message: "请选择人员", duration: 1000 });
      }
    },
    handleSearch() {
      let search = this.query.search;
      this.list.forEach(item => {
        if (item.realname.indexOf(search) > -1) {
          item.show = true;
        } else {
          item.show = false;
        }
      });
      this.$forceUpdate();
      // this.finished = false;
      // this.loading = false;
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
.pick-driver {
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
    min-height: 100%;
  }
  .van-search {
    background: #fff;
    .van-search__content {
      border: 1px solid #d7dade;
    }
  }
  .tel {
    line-height: 20px;
    margin-left: 4px;
    i {
      font-size: 18px;
      position: relative;
      top: 4px;
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