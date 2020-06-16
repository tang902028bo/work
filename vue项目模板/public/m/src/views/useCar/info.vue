<template>
  <van-skeleton title avatar :row="3" :loading="loading">
    <div class="info-box">
      <div class="info">
        <div class="title">
          <van-image width="56" height="56" :src="info.avatar" radius="4" />
          <span>{{ info.user_name }}的用车申请记录</span>
          <van-tag v-if="info.status==0" plain type="primary">待审批</van-tag>
          <van-tag
            v-else-if="info.status==1 && info.car_use_status==1"
            plain
            type="success"
          >已通过-等待出行</van-tag>
          <van-tag v-else-if="info.status==2" plain type="warning">已驳回</van-tag>
          <van-tag v-else-if="info.status==3" plain>已撤销</van-tag>
          <van-tag v-else-if="info.status==1 && info.car_use_status==2" plain type="primary">已出场-用车中</van-tag>
          <van-tag v-else-if="info.status==1 && info.car_use_status==3" plain type="primary">已出场-回程中</van-tag>
          <van-tag
            v-else-if="info.status==1 && info.car_use_status==4"
            plain
            type="primary"
          >已回场-用车结束</van-tag>
          <van-tag v-else-if="info.status==4&&info.car_use_status==0" plain type="warning">取消用车</van-tag>
          <van-tag v-else plain type="primary">已完成</van-tag>
        </div>
        <div class="apply-info">
          <p>
            <span class="prop-name">用车编号：</span>
            {{ info.approval_sn }}
          </p>
          <p>
            <span class="prop-name">申请时间：</span>
            {{ info.createtime | timeFormat("yyyy-mm-dd") }}
          </p>
          <p>
            <span class="prop-name">用车人电话：</span>
            {{ info.mobile }}
          </p>
          <p>
            <span class="prop-name">所在部门：</span>
            {{ info.department_name }}
          </p>
          <p>
            <span class="prop-name">车辆类型：</span>
            {{ info.type_name }}
          </p>
          <p>
            <span class="prop-name">开始时间：</span>
            {{ info.start_time| timeFormat("yyyy-mm-dd") }}
          </p>
          <p>
            <span class="prop-name">乘车人数：</span>
            {{ info.all_userid }}
          </p>
          <p>
            <span class="prop-name">出发地：</span>
            {{ info.from_address }}
          </p>
          <p>
            <span class="prop-name">目的地：</span>
            {{ info.to_address }}
          </p>
          <p>
            <span class="prop-name">司机配备：</span>
            {{ info.have_driver==1 ?"需要":"不需要" }}
          </p>
          <p>
            <span class="prop-name">用车事由：</span>
            {{ info.cause }}
          </p>
          <p>
            <span v-if="info.log_cause" class="prop-name">备注：</span>
            <span style="color:red;">{{ info.log_cause }}</span>
          </p>
        </div>
      </div>
      <div class="approve-box">
        <div class="title">审批流程</div>
        <van-steps direction="vertical" :active="active" active-color="#0082ef">
          <van-step v-for="(item,index) in info.progress" :key="index">
            <template v-if="active == index && item.is_approval==1" #active-icon>
              <van-icon name="checked" class="success" />
            </template>
            <template v-else-if="item.is_approval==2" #active-icon>
              <van-icon name="clear" class="close" />
            </template>
            <template v-else #active-icon>
              <i class="aprove" />
            </template>
            <div class="item">
              <div class="photo">
                <van-icon name="friends" />
              </div>
              <div class="title">
                <span>
                  <span class="role-name">{{ item.approve_name }}</span>
                  <span v-if="item.is_approval==1">·已同意</span>
                  <span v-else-if="item.is_approval==2">·已驳回</span>
                  <span v-else>·审核中</span>
                </span>
                <span>({{ item.is_approval_number }}/{{ item.approval_number }})</span>
                <van-tag type="primary" plain color="#467DB9">{{ item.type ===1?"会签":"或签" }}</van-tag>
                <van-icon
                  v-if="item.user_list.length >0"
                  :name="item.show?'arrow-up':'arrow-down'"
                  @click="handleUserShow(index)"
                />
                <div v-if="item.is_approval_time > 0 " class="time">
                  <span>{{ item.is_approval_time | timeFormat("mm-dd hh:mm") }}</span>
                </div>
              </div>
            </div>
            <ul v-show="item.show" class="user-list">
              <li v-for="user in item.user_list" :key="user.id">
                <div class="left">
                  <div class="photo">
                    <img :src="user.avatar" />
                  </div>
                  {{ user.role_name ? `(${user.role_name})`:"" }}
                  <span>{{ user.name }}{{ user.is_approval==1?"·已同意":user.is_approval==2?"·已驳回":"" }}</span>
                </div>
                <div
                  v-if="user.is_approval_time >0"
                  class="time"
                >{{ user.is_approval_time | timeFormat("mm-dd hh:mm") }}</div>
              </li>
            </ul>
          </van-step>
        </van-steps>
      </div>
      <div class="copyer">抄送人：{{ info.have_driver==1?"司机、":"" }}{{ info.copyer_name }}</div>
      <div v-if="info.status==0" class="foot">
        <div @click="handleClick('reminder')">催办</div>
        <div @click="handleClick('revoke')">撤销</div>
        <div @click="handleClick('anew')">重新申请</div>
      </div>
    </div>
  </van-skeleton>
</template>
<script>
import { approveHttpInteractor } from "@/api";
import { vaildateJsonString } from "@/utils/validate";
export default {
  data() {
    return {
      loading: true,
      id: "",
      active: -1,
      approveStatus: "1", //当前审批所处状态
      info: {
        approval_sn: "",
        have_driver: "",
        mobile: "",
        from_address: "",
        to_address: "",
        all_userid: 1,
        department: "",
        avatar: "",
        user_name: "",
        start_time: "",
        end_time: "",
        cause: "",
        createtime: "",
        status: "",
        car_use_status: "",
        type_name: "",
        department_name: "",
        all_user: []
      }
    };
  },
  created() {
    this.id = this.$route.params.id;
    this.approveStatus = this.$route.params.status;
    this.getData();
  },
  methods: {
    async getData() {
      let { msg, code, data } = await approveHttpInteractor.getInfo({
        id: this.id,
        type: 1
      });
      if (code === 200) {
        this.loading = false;
        let from_address = "",
          to_address = "";
        this.info = Object.assign({}, data);
        if (vaildateJsonString(this.info.from_address)) {
          from_address = JSON.parse(this.info.from_address);
          to_address = JSON.parse(this.info.to_address);
          this.info.from_address = `${from_address.area} ${from_address.detail}`;
          this.info.to_address = `${to_address.area} ${to_address.detail}`;
        }
        this.info.progress = this.converProgress(this.info.progress);
        this.info.copyer_name = Array.isArray(this.info.copyer_user)
          ? this.info.copyer_user.map(item => item.name).join("、")
          : "";
      } else {
        this.$notify({ type: "danger", message: msg, duration: 1000 });
        this.$router.push("/use");
      }
    },
    // 处理流程数据
    converProgress(data) {
      data.forEach(item => {
        let is_approval = [];
        if (item.approver_type === 1) {
          item.user_list = item.leader_arr;
          item.approve_name = "上级主管";
        } else {
          item.user_list = item.role_user_arr;
          item.approve_name = item.approval_role
            .map(item => item.role_name)
            .join("/");
        }
        is_approval = item.user_list.filter(user => user.is_approval > 0);
        item.show = false;
        item.approval_number = item.user_list.length;
        item.is_approval_number = is_approval.length;
        item.is_approval_time =
          item.is_approval_number > 0 ? is_approval[0].is_approval_time : 0;
        if (item.is_deal_approval == 1) {
          item.is_approval = item.last_approval_status;
          this.active++;
        }
      });
      return data;
    },
    handleClick(cmd) {
      let msg = {
        reminder: "是否催办该条审批，确定继续？",
        revoke: "是否撤销该条审批，确定继续？",
        anew: "重新提交后，当前用车审批将自动撤销，确定继续？"
      };
      this.$dialog
        .confirm({
          title: "提示",
          message: msg[cmd],
          beforeClose: (action, done) => this.beforeClose(action, done, cmd)
        })
        .catch(() => {
          // on cancel
        });
    },
    // 显示隐藏成员
    handleUserShow(index) {
      this.info.progress[index].show = !this.info.progress[index].show;
      this.$forceUpdate();
    },
    beforeClose(action, done, cmd) {
      if (action === "confirm") {
        this.approveAction(cmd, done);
      } else {
        done();
      }
    },
    async approveAction(action, done) {
      if (action === "revoke" || action === "anew") {
        const { code, msg } = await approveHttpInteractor.approveRevoke({
          id: this.id
        });
        if (code === 200) {
          if (action === "anew") {
            this.$router.push(`/use/edit/${this.id}`);
          } else {
            this.$notify({
              type: "success",
              message: msg,
              duration: 1000
            });
            this.getData();
            this.$router.push("/use");
          }
          done();
        } else {
          this.$notify({
            type: "danger",
            message: msg,
            duration: 1000
          });
          done(false);
        }
      } else {
        const { code, msg } = await approveHttpInteractor.approveReminder({
          id: this.id
        });
        if (code === 200) {
          this.$notify({
            type: "success",
            message: msg,
            duration: 1000
          });
          this.getData();
          this.$router.push("/use");
          done();
        } else {
          this.$notify({
            type: "danger",
            message: msg,
            duration: 1000
          });
          done(false);
        }
      }
    }
  }
};
</script>
<style lang="less" scoped>
.info-box {
  background: #f5f5f5;
  padding-bottom: 60px;
  .title {
    font-weight: bold;
    font-size: 16px;
    display: flex;
    align-items: center;
    span {
      margin-left: 10px;
    }
  }
  .info {
    padding: 15px;
    font-size: 14px;
    background: #fff;
    .prop-name {
      color: #979797;
      display: inline-block;
      width: 90px;
      text-align: right;
    }
  }
  .approve-box {
    margin-top: 10px;
    background: #fff;
    padding: 15px;
    .photo {
      background: #abbacb;
      width: 24px;
      height: 24px;
      line-height: 24px;
      text-align: center;
      border-radius: 2px;
      color: #fff;
      font-size: 18px;
      overflow: hidden;
      display: inline-block;
      vertical-align: middle;
      flex-shrink: 0;
      img {
        width: 100%;
        display: block;
      }
    }
    /deep/.van-step--finish .van-step__circle {
      background-color: #0082ef;
    }
    .item {
      display: flex;
      align-items: center;
      font-size: 12px;
      color: #666;
      .photo {
        display: flex;
        justify-content: center;
        align-items: center;
      }
      .title {
        font-size: 14px;
        margin: 0;
        font-weight: normal;
        flex: auto;
        width: 100%;
        position: relative;
        .role-name {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          display: inline-block;
          vertical-align: middle;
          max-width: 60px;
          margin: 0;
        }
        span {
          margin: 0 2px;
          vertical-align: middle;
        }
        .van-tag {
          font-weight: normal;
          font-size: 12px;
          padding: 0 2px;
          margin: 0;
          padding: 2px 4px !important;
          height: 18px !important;
        }
        .time {
          float: right;
          font-weight: normal;
          font-size: 12px;
          text-align: right;
          position: absolute;
          right: 9px;
        }
        .van-icon {
          top: 2px;
        }
      }
    }
    .user-list {
      background: #f5f5f5;
      margin-left: 5px;
      margin-top: 5px;
      li {
        margin: 5px 0;
        padding: 5px 10px;
        color: #666;
        display: flex;
        justify-content: space-between;
        align-items: center;
        .photo {
          margin-right: 10px;
        }
        .time {
          font-size: 12px;
        }
      }
    }
    h3 {
      margin: 0;
      font-weight: normal;
      font-size: inherit;
    }
  }
  .copyer {
    color: #2d3034;
    font-size: 12px;
    line-height: 40px;
    border-top: 1px solid #e8e8ee;
    background: #fff;
    padding: 0 20px;
  }
  .foot {
    width: 100%;
    position: fixed;
    bottom: 0;
    display: flex;
    line-height: 24px;
    padding: 10px 0;
    background: #fff;
    z-index: 2;
    box-shadow: 0px 0 1px 1px rgba(63, 63, 63, 0.1);
    div {
      flex: 1;
      text-align: center;
      font-size: 14px;
      cursor: pointer;
      &:nth-child(2) {
        border-left: 1px solid #ccc;
        border-right: 1px solid #ccc;
        color: #0082ef;
      }
    }
  }
}
</style>