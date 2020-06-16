<template>
  <div
    v-if="_show"
    class="pick-user"
  >
    <header
      ref="container"
      :container="container"
    >
      <van-sticky>
        <van-search
          v-model="query.name"
          placeholder="搜索名字"
          background="#F5F5F5"
          show-action
          @search="handleSearch"
          @cancel="handleCancel"
        />
      </van-sticky>
    </header>
    <van-pull-refresh
      v-model="refreshing"
      @refresh="onRefresh"
    >
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        class="list"
      >
        <van-radio-group
          v-if="single"
          v-model="checkSingleData"
        >
          <van-cell-group>
            <div
              v-for="(item, index) in list"
              :key="index"
            >
              <van-cell v-show="item.show">
                <template #title>
                  <div class="info">
                    <div class="photo">
                      <img :src="item.avatar">
                    </div>
                    <div class="name-box">
                      <div class="name">
                        {{ item.name }}
                      </div>
                      <div class="depart">
                        {{ item.department_name }}
                      </div>
                    </div>
                  </div>
                </template>
                <template #right-icon>
                  <van-radio
                    :name="item"
                    checked-color="#467DB9"
                  />
                </template>
              </van-cell>
            </div>
          </van-cell-group>
        </van-radio-group>
        <van-checkbox-group
          v-else
          v-model="multipleSelection"
          @change="handleCheckData"
        >
          <van-cell-group>
            <div
              v-for="(item, index) in list"
              :key="index"
            >
              <van-cell v-show="item.show">
                <template #title>
                  <div class="info">
                    <div class="photo">
                      <img :src="item.avatar">
                    </div>
                    <div class="name-box">
                      <div class="name">
                        {{ item.name }}
                      </div>
                      <div class="depart">
                        {{ item.department_name }}
                      </div>
                    </div>
                  </div>
                </template>
                <template
                  v-show="item.show"
                  #right-icon
                >
                  <van-checkbox
                    :name="item"
                    shape="square"
                    checked-color="#467DB9"
                    @click="handleCheckDataChild(item.id)"
                  />
                </template>
              </van-cell>
            </div>
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
        <van-button
          round
          type="info"
          color="#2F7DCD"
          @click="handleConfirm"
        >
          确定
        </van-button>
      </div>
    </div>
  </div>
</template>
<script>
import { publicHttpInteractor } from "@/api";
export default {
  name: "PickerUser",
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
      multipleSelection: [], //多选值
      multipleSelectionAll: [],
      loading: false,
      finished: false,
      refreshing: false,
      query: {
        name: "",
        page: 0,
        limit: 150
      },
      count: 0,
      container: null,
      itemId: ""
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
        return this.multipleSelectionAll.length;
      }
    }
  },
  watch: {
    _show(val) {
      if (val) {
        this.multipleSelectionAll = [];
        this.setCheckData();
        this.finished = false;
        this.query.name = "";
        this.handleSearch();
      }
    }
  },
  created () {
    this.onLoad();
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
    handleCheckData(val) {
      if (!val.some(item => item.id == this.itemId)) {
        this.multipleSelectionAll = this.multipleSelectionAll.filter(
          item => item.id != this.itemId
        );
      }
      this.changePageCoreRecordData();
    },
    handleCheckDataChild(id) {
      this.itemId = id;
    },
    changePageCoreRecordData() {
      let idKey = "id";
      let that = this;
      // 如果总记忆中还没有选择的数据，那么就直接取当前页选中的数据，不需要后面一系列计算
      if (this.multipleSelectionAll.length <= 0) {
        this.multipleSelectionAll = this.multipleSelection;
        return;
      }
      // 总选择里面的key集合
      let selectAllIds = [];
      this.multipleSelectionAll.forEach(row => {
        selectAllIds.push(row[idKey]);
      });
      let selectIds = [];
      // 获取当前页选中的id
      this.multipleSelection.forEach(row => {
        selectIds.push(row[idKey]);
        // 如果总选择里面不包含当前页选中的数据，那么就加入到总选择集合里
        if (selectAllIds.indexOf(row[idKey]) < 0) {
          that.multipleSelectionAll.push(row);
        }
      });
      let noSelectIds = [];
      // 得到当前页没有选中的id
      this.list.forEach(row => {
        if (selectIds.indexOf(row[idKey]) < 0) {
          noSelectIds.push(row[idKey]);
        }
      });
    },
    onLoad() {
      this.getUserData();
      if (this.refreshing) {
        this.query.page = 1;
        this.list = [];
        this.refreshing = false;
      } else {
        this.query.page++;
      }
    },
    async getUserData() {
      try {
        let { data, total, code } = await publicHttpInteractor.getUserList(
          this.query
        );
        if (code == 1) {
          this.count = total;
          this.loading = false;
          if (this.query.page === 1) {
            this.list = data;
          } else {
            this.list = [...this.list, ...data];
          }
          if (data.length <= this.query.pagesize){
            this.finished = true;
          }
          this.setCheckData();
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
    handleConfirm() {
      let selectData = [];
      if (this.selectNum > 0) {
        if (this.single) {
          selectData.push(this.checkSingleData);
        } else {
          selectData = this.multipleSelectionAll;
        }
        this._show = false;
        this.$emit("done", selectData);
      } else {
        this.$notify({ type: "danger", message: "请选择人员", duration: 1000 });
      }
    },
    handleSearch() {
      let name = this.query.name;
      this.list.forEach(item => {
        if (item.name.indexOf(name) > -1) {
          item.show = true;
        } else {
          item.show = false;
        }
      });
      this.$forceUpdate();
      this.finished = false;
      this.loading = false;
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
.pick-user {
  position: fixed;
  height: 100%;
  width: 100%;
  background: #fff;
  overflow: auto;
  top: 0;
  left: 0;
  .van-search {
    background: #fff;
    .van-search__content {
      border: 1px solid #d7dade;
    }
  }
  .list,
  .van-pull-refresh {
    min-height: 100%;
  }
  .list {
    .info {
      display: flex;
      align-items: center;
      .photo {
        width: 42px;
        height: 42px;
        border-radius: 4px;
        overflow: hidden;
        display: flex;
        justify-content: center;
        align-items: center;
        margin-right: 10px;
        img {
          display: block;
          width: 100%;
        }
      }
      .depart {
        font-size: 12px;
        color: #9b9b9b;
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
    }
  }
}
</style>