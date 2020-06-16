<template>
  <div class="use-box">
    <van-pull-refresh
      v-model="refreshing"
      @refresh="onRefresh"
    >
      <van-list
        v-model="loading"
        :finished="finished"
        finished-text="没有更多了"
        class="list"
        :offset="60"
        @load="onLoad"
      >
        <van-cell
          v-for="item in list"
          :key="item.id"
          class="item"
          @click="$router.push(`/use/info/${item.id}/${status}`)"
        >
          <van-skeleton
            title
            :row="3"
            :loading="skeShow"
          >
            <van-row>
              <van-col
                span="19"
                class="title"
              >
                {{ item.user_name }}的用车申请
                <van-tag
                  v-if="item.status==0"
                  plain
                  type="primary"
                >
                  待审批
                </van-tag>
                <van-tag
                  v-else-if="item.status==1 && item.car_use_status==1"
                  plain
                  type="success"
                >
                  已通过-等待出行
                </van-tag>
                <van-tag
                  v-else-if="item.status==2"
                  plain
                  type="warning"
                >
                  已驳回
                </van-tag>
                <van-tag
                  v-else-if="item.status==3"
                  plain
                >
                  已撤销
                </van-tag>
                <van-tag
                  v-else-if="item.status==1 && item.car_use_status==2"
                  plain
                  type="primary"
                >
                  已出场-用车中
                </van-tag>
                <van-tag
                  v-else-if="item.status==1 && item.car_use_status==3"
                  plain
                  type="primary"
                >
                  已出场-回程中
                </van-tag>
                <van-tag
                  v-else-if="item.status==1 && item.car_use_status==4"
                  plain
                  type="primary"
                >
                  已回场-用车结束
                </van-tag>
                <van-tag
                  v-else-if="item.status==4&&item.car_use_status==0"
                  plain
                  type="warning"
                >
                  取消用车
                </van-tag>
                <van-tag
                  v-else
                  plain
                  type="primary"
                >
                  已完成
                </van-tag>
              </van-col>
              <van-col
                span="5"
                class="time"
              >
                {{ item.createtime | timeFormat("yyyy-mm-dd") }}
              </van-col>
            </van-row>
            <p>
              <span class="prop-name">开始时间：</span>
              <span>{{ item.start_time | timeFormat("yyyy-mm-dd") }}</span>
            </p>
            <p>
              <span class="prop-name">用车事由：</span>
              <span>{{ item.cause }}</span>
            </p>
            <div class="option">
              <van-button
                v-if="item.status==1 && item.car_use_status==1"
                type="default"
                @click.stop="handleClick('giveUp',item.id)"
              >
                放弃用车
              </van-button>
              <van-button
                v-if="item.status==1 && item.car_use_status==2"
                type="info"
                @click.stop="handleClick('arrive',item.id)"
              >
                到达目的地
              </van-button>
            </div>
          </van-skeleton>
        </van-cell>
        <van-dialog
          v-model="show"
          title="提示"
          show-cancel-button
          @confirm="onConfirm"
        >
          <div class="content">
            <div class="message">
              {{ msg[dialogType] }}
            </div>
            <van-field
              v-if="dialogType=='giveUp'"
              v-model="cause"
              rows="1"
              autosize
              type="textarea"
              maxlength="50"
              placeholder="请输入放弃用车原因"
              show-word-limit
            />
          </div>
        </van-dialog>
      </van-list>
    </van-pull-refresh>
  </div>
</template>
<script>
import { approveHttpInteractor } from "@/api";
export default {
  props: {
    status: {
      type: String,
      default: "1"
    },
    active: {
      type: Number,
      default: 0
    }
  },
  data() {
    return {
      list: [],
      loading: false,
      skeShow: true,
      finished: false,
      refreshing: false,
      show: false,
      dialogType: "",
      id: "",
      cause: "",
      msg: {
        giveUp: "放弃用车后，该条审批将终止，确定放弃？",
        arrive: "当前已到达目的地！"
      },
      query: {
        page: 0,
        pagesize: 6
      },
      count: 0,
      isOnload: false
    };
  },
  watch: {
    active() {
      this.refreshing = true;
      this.onRefresh();
    }
  },
  methods: {
    onLoad() {
      this.getApproveList({ status: this.status });
      if (this.refreshing) {
        this.query.page = 1;
        this.list = [];
        this.refreshing = false;
      } else {
        this.query.page++;
      }
    },
    async getApproveList(query) {
      try {
        this.query = Object.assign({}, this.query, query);
        const {
          code,
          data: { list, count }
        } = await approveHttpInteractor.applyList(this.query);
        if (code === 200) {
          this.count = count;
          this.skeShow = false;
          this.loading = false;
          if (this.query.page === 1) {
            this.list = list;
          } else {
            this.list = [...this.list, ...list];
          }
          if (list.length <= this.query.pagesize){
            this.finished = true;
          }
        } else {
          this.finished = true;
        }
      } catch {
        this.finished = true;
      }
    },
    onRefresh() {
      // 清空列表数据
      this.finished = false;

      // 重新加载数据
      // 将 loading 设置为 true，表示处于加载状态
      this.loading = true;
      this.onLoad();
    },
    handleClick(type, id) {
      this.dialogType = type;
      this.id = id;
      this.show = true;
    },
    async onConfirm() {
      let result = {};
      if (this.dialogType == "giveUp") {
        result = await approveHttpInteractor.giveUp({
          id: this.id,
          cause: this.cause
        });
      } else {
        result = await approveHttpInteractor.arrived({ id: this.id });
      }
      let { msg, code } = result;
      if (code == 200) {
        this.$notify({
          type: "success",
          message: "操作成功",
          duration: 1000
        });
        this.refreshing = true;
        this.onLoad();
        this.show = false;
      } else {
        this.$notify({ type: "danger", message: msg, duration: 1000 });
      }
    }
  }
};
</script>
<style lang="less" scope>
.use-box {
  height: 100%;
  overflow: hidden;
  .list {
    background: #f5f5f5;
    min-height: 400px;
    .item {
      background: #fff;
      border-radius: 5px;
      width: 95%;
      margin: 5px auto;
      position: relative;
      .title {
        font-size: 16px;
        font-weight: bold;
      }
      .van-tag {
        margin-left: 10px;
      }
      .time {
        font-size: 12px;
        color: #979797;
        position: absolute;
        right: 0px;
        top: 0px;
        width: 80px;
        text-align: right;
      }
      .prop-name {
        color: #979797;
      }
      .option {
        position: absolute;
        bottom: 10px;
        right: 10px;
        button {
          padding: 0 10px;
          height: 34px;
          line-height: 36px;
          border-radius: 4px;
        }
      }
    }
    .content {
      text-align: center;
      color: #979797;
      font-size: 12px;
      .message {
        line-height: 40px;
      }
      .van-field {
        border: 1px solid #e8e8e8;
        width: 90%;
        margin: 10px auto;
        font-size: 12px;
        padding: 5px;
      }
    }
  }
}
</style>