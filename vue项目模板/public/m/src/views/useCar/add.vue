<template>
  <div>
    <van-form class="add-approve" @submit="onSubmit">
      <van-field
        v-model="pickCheckName.depart"
        required
        name="部门"
        label="部门"
        autocomplete="false"
        readonly
        input-align="right"
        right-icon="arrow"
        placeholder="请选择部门"
        :rules="[{ required: true, message: '请选择部门', trigger:'onChange'}]"
        @click="showPicker=true;pickType='depart'"
      />
      <van-field
        v-model="pickCheckName.type"
        required
        name="typeId"
        label="车辆类型"
        placeholder="请选择车辆类型"
        readonly
        input-align="right"
        right-icon="arrow"
        :rules="[{ required: true, message: '请选择车辆类型', trigger:'onChange'}]"
        @click="showPicker=true;pickType='type'"
      />
      <van-field
        required
        v-model="form.all_userid"
        name="all_userid"
        label="乘车人数"
        type="digit"
        input-align="right"
        placeholder="请输入乘车人数"
      ></van-field>
      <van-field required name="haveDriver" label="司机配置" input-align="right">
        <template #input>
          <van-radio-group v-model="form.have_driver" direction="horizontal">
            <van-radio name="1" checked-color="#467DB9">是</van-radio>
            <van-radio name="2" checked-color="#467DB9">否</van-radio>
          </van-radio-group>
        </template>
      </van-field>
      <van-field
        required
        readonly
        clickable
        name="startTime"
        :value="form.start_time"
        label="开始时间"
        placeholder="点击选择日期"
        input-align="right"
        right-icon="arrow"
        :rules="[{ required: true, message: '请选择开始时间',trigger:'onChange' }]"
        @click="showCalendar = true;pickType='start_time'"
      />
      <van-field
        v-model="form.from_address"
        required
        readonly
        clickable
        name="fromArea"
        label="出发地"
        placeholder="请选择出发地"
        input-align="right"
        right-icon="arrow"
        :rules="[{ required: true, message: '请选择出发地',trigger:'onChange' }]"
        @click="showPickerAddress = true;areaType='from_address'"
      />
      <van-field
        v-model="form.to_address"
        readonly
        clickable
        required
        name="toArea"
        label="目的地"
        placeholder="请选择目的地"
        input-align="right"
        right-icon="arrow"
        :rules="[{ required: true, message: '请选择目的地' ,trigger:'onChange'}]"
        @click="showPickerAddress = true;areaType='to_address'"
      />
      <van-field
        v-model="form.mobile"
        type="tel"
        required
        label="手机号"
        placeholder="请输入手机号"
        input-align="right"
        :rules="[{ pattern: /^1[3456789]\d{9}$/, message: '目前只支持中国大陆的手机号码', trigger:'onChange'}]"
      />
      <van-field
        v-model="form.cause"
        rows="2"
        autosize
        label="用车事由"
        type="textarea"
        maxlength="50"
        placeholder="用车事由"
        show-word-limit
      />
      <div class="approve-box">
        <div class="item">
          <div class="title">
            审批人
            <span>（已由管理员预设不可更改）</span>
          </div>
          <ul v-if="stepList.length > 0">
            <li v-for="(item ,index) in stepList" :key="index">
              <template v-if="item.approver_type==1">
                <div class="item">
                  <div class="photo">
                    <van-icon name="friends" />
                  </div>
                  <p>{{ "上级主管" }}</p>
                  <van-tag type="primary" plain color="#467DB9">{{ item.type ===1?"会签":"或签" }}</van-tag>
                </div>
              </template>
              <template v-else>
                <div v-for="(role,i) in item.role_user_arr" :key="i" class="item">
                  <div class="photo">
                    <van-icon name="friends" />
                  </div>
                  <p>{{ role.role_name }}</p>
                  <van-tag type="primary" plain color="#467DB9">{{ item.type ===1?"会签":"或签" }}</van-tag>
                </div>
              </template>
            </li>
          </ul>
          <div v-else class="tips">未设置审批流程，请联系管理员设置审批流程</div>
        </div>
        <div class="item">
          <div class="title">抄送人</div>
          <ul>
            <li>
              <div class="item">
                <div class="photo">
                  <van-icon name="friends" />
                </div>
                <p>司机</p>
              </div>
            </li>
            <li v-for="(item,index) in pickerUsers.copyer_id" :key="index">
              <div class="item">
                <div class="photo">
                  <img v-if="item.avatar" :src="item.avatar" />
                  <van-icon v-else name="friends" />
                  <van-button
                    native-type="button"
                    class="close"
                    @click="handleDelUser(index,'copyer_id')"
                  >
                    <van-icon name="cross" />
                  </van-button>
                </div>
                <p>{{ item.name }}</p>
              </div>
            </li>
            <li>
              <div class="item">
                <van-button
                  class="add"
                  native-type="button"
                  @click="showPickerUser=true;single=false;pickerUserType='copyer_id'"
                >
                  <van-icon name="plus" />
                </van-button>
                <p style="margin-top:0;">添加</p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div style="margin: 16px;">
        <van-button
          :disabled="stepList.length===0"
          type="info"
          size="large"
          color="#467DB9"
          native-type="submit"
          :loading="button.loading"
          :loading-text="button.loadingTxt"
        >{{ stepList.length===0 ?'未设置审批流程，联系管理员':'提交' }}</van-button>
      </div>
    </van-form>
    <van-calendar v-model="showCalendar" color="#467db9" @confirm="handleDateChange" />
    <pickerUser
      :single="single"
      :show.sync="showPickerUser"
      :data="pickerUsers[pickerUserType]"
      @done="pickerUserDone"
    />
    <picker-address
      :show.sync="showPickerAddress"
      :data="pickerAddress[areaType]"
      @done="pickerAddressDone"
    />
    <van-popup v-model="showPicker" position="bottom">
      <van-picker
        show-toolbar
        :columns="pickData[pickType]"
        @confirm="onConfirm"
        @cancel="showPicker = false"
      />
    </van-popup>
  </div>
</template>
<script>
import { dateFormat, calcDate } from "@/utils/format/date";
import pickerUser from "@/components/public/pickerUser";
import pickerAddress from "@/components/public/pickerAddress";
import { approveHttpInteractor, typeHttpInteractor } from "@/api";
import { qqMaps } from "@/plugin";
export default {
  components: {
    pickerUser,
    pickerAddress
  },
  data() {
    return {
      showPicker: false,
      showCalendar: false,
      activeIndex: "",
      activeId: "",
      pickType: "",
      showPickerUser: false,
      showPickerAddress: false,
      single: true,
      form: {
        department_id: "",
        car_type_id: "",
        start_time: "",
        have_driver: "1",
        all_userid: "",
        from_address: "",
        to_address: "",
        mobile: "",
        cause: "",
        copyer_id: "",
        travel_mileage: 1,
        type: 1
      },
      pickData: {
        type: [],
        depart: []
      },
      pickCheckName: {
        type: "",
        depart: ""
      },
      pickerUsers: {
        all_userid: [],
        copyer_id: []
      },
      pickerUserType: "all_userid",
      areaType: "from_address",
      pickerAddress: {
        from_address: {},
        to_address: {}
      },
      typeData: [],
      stepList: [],
      copyerList: [],
      button: {
        loading: false,
        loadingTxt: "提交中..."
      },
      submit: false
    };
  },
  computed: {
    departList() {
      return this.$store.state.user.userInfo.dep_names;
    },
    rootPath() {
      return this.$store.state.common.rootPath;
    }
  },
  watch: {
    pickerUsers: {
      handler(value) {
        if (value[this.pickerUserType].length > 0) {
          if (this.single) {
            this.form.userid = value[this.pickerUserType][0].userid;
          } else {
            this.form[this.pickerUserType] = value[this.pickerUserType]
              .map(item => item.userid)
              .join(",");
          }
        }
      },
      deep: true
    }
  },
  created() {
    // this.getDepartData();
    this.getTypeData();
    if (this.departList.length > 0 && !this.id) {
      this.pickData.depart = this.departList.map(item => item.dep_name);
      this.pickCheckName.depart = this.departList[0].dep_name;
      this.form.department_id = this.departList[0].id;
      this.getApproveSteps();
    }
    this.id = this.$route.params.id;
    if (this.id) {
      this.getData();
    }
  },
  methods: {
    async getData() {
      let { msg, code, data } = await approveHttpInteractor.getInfo({
        id: this.id
      });
      this.loading = false;
      if (code === 200) {
        let formData = Object.assign({}, data);
        let from_address = JSON.parse(formData.from_address);
        let to_address = JSON.parse(formData.to_address);
        this.pickerAddress.from_address = from_address;
        this.pickerAddress.to_address = to_address;
        formData.from_address = `${from_address.area} ${from_address.detail}`;
        formData.to_address = `${to_address.area} ${to_address.detail}`;
        formData.start_time = dateFormat(
          new Date(formData.start_time * 1000),
          "yyyy-MM-dd"
        );
        formData.have_driver = formData.have_driver.toString();
        this.pickCheckName.type = formData.type_name;
        this.pickCheckName.depart = formData.department_name;
        this.pickerUsers.all_userid = Array.isArray(formData.all_user)
          ? formData.all_user
          : [];
        this.pickerUsers.copyer_id = Array.isArray(formData.copyer_user)
          ? formData.copyer_user
          : [];
        for (var i in this.form) {
          this.form[i] = formData[i];
        }
        this.getApproveSteps();
        // this.info.copyer_name = this.info.copyer_name.join("、");
      } else {
        this.$notify({ type: "danger", message: msg, duration: 1000 });
      }
    },
    //选择器确认
    async onConfirm(values) {
      switch (this.pickType) {
        case "depart":
          if (this.departList.length > 0) {
            this.pickCheckName.depart = values;
            this.form.department_id = this.departList.filter(
              item => item.dep_name === values
            )[0].id;
            this.getApproveSteps();
          } else {
            this.$notify({
              type: "danger",
              message: "当前用户没有部门，请联系管理员",
              duration: 1000
            });
          }
          break;
        case "type":
          if (this.typeData.length > 0) {
            this.pickCheckName.type = values;
            this.form.car_type_id = this.typeData.filter(
              item => item.name === values
            )[0].id;
          } else {
            this.$notify({
              type: "danger",
              message: "暂无车辆类型，请联系管理员",
              duration: 1000
            });
          }
          break;
        default:
          break;
      }
      this.showPicker = false;
    },
    //选择日期
    handleDateChange(date) {
      this.form[this.pickType] = dateFormat(date, "yyyy-MM-dd");
      this.showCalendar = false;
      this.getApproveSteps();
    },
    // 选择乘车人
    pickerUserDone(value) {
      this.pickerUsers[this.pickerUserType] = value;
    },
    async pickerAddressDone(value) {
      this.form[this.areaType] = `${value.area} ${value.detail}`;
      this.pickerAddress[this.areaType] = value;
      if (this.form.from_address && this.form.to_address) {
        let fromLoc = this.pickerAddress.from_address.location;
        let toLoc = this.pickerAddress.to_address.location;
        this.form.travel_mileage = await qqMaps.getDistance(fromLoc, toLoc);
        if (this.form.travel_mileage === 0) {
          this.form.to_address = "";
          this.pickerAddress.to_address = {};
          this.$notify({
            type: "danger",
            message: "出发地和目的地不能相同",
            duration: 1000
          });
        }
      }
    },
    // 删除乘车人
    handleDelUser(index, type) {
      this.pickerUsers[type].splice(index, 1);
    },
    // 获取车辆类型
    async getTypeData() {
      try {
        let { data } = await typeHttpInteractor.getList();
        this.typeData = data;
        this.pickData.type = data.map(item => item.name);
      } catch (error) {
        console.log(error);
      }
    },
    // 根据用户所在部门获取审批流程
    async getApproveSteps() {
      try {
        let { data } = await approveHttpInteractor.approveStep({
          department_id: this.form.department_id,
          date:this.form.start_time
        });
        this.stepList = data;
      } catch (error) {
        console.log(error);
      }
    },
    //提交数据
    async onSubmit() {
      if (this.form.travel_mileage === 0) {
        this.$notify({
          type: "danger ",
          message: "出发地和目的地不能相同",
          duration: 1000
        });
        return false;
      }
      this.button.loading = true;
      const toast = this.$toast.loading({
        duration: 0, // 持续展示 toast
        forbidClick: true,
        message: "数据提交中，请稍后..."
      });
      try {
        let postData = Object.assign({}, this.form);
        postData.from_address = JSON.stringify(this.pickerAddress.from_address);
        postData.to_address = JSON.stringify(this.pickerAddress.to_address);
        let { code, msg } = await approveHttpInteractor.approveAdd(postData);
        toast.clear();
        this.button.loading = false;
        if (code === 200) {
          this.submit = true;
          this.$notify({ type: "success", message: msg, duration: 1000 });
          this.$router.push("/use");
        } else {
          this.$notify({ type: "danger", message: msg, duration: 1000 });
        }
      } catch (error) {
        console.log(error);
        this.button.loading = false;
      }
    }
  },
  beforeRouteLeave(to, from, next) {
    //this.submit用来判断是点击提交以后的后退 还是点击了后退按钮
    if (this.submit) {
      next();
    } else {
      //弹出提示框
      this.$dialog
        .confirm({
          title: "提示",
          message: "退出后内容将不会保存，您是否要继续?",
          confirmButtonColor: "#467db9",
          confirmButtonText: "继续填写"
        })
        .then(() => {
          next(false);
        })
        .catch(() => {
          next();
        });
    }
  }
};
</script>
<style lang="less" scoped>
.add-approve {
  .users-box {
    .van-tag {
      margin: 0 5px;
    }
  }
  button {
    border-radius: 5px;
    margin-top: 20px;
    line-height: 46px;
    height: 46px;
  }
  .approve-box {
    margin-top: 10px;
    background: #fff;
    padding: 0 10px;
    .tips {
      line-height: 50px;
      color: red;
      padding-left: 20px;
    }
    .item {
      .title {
        font-weight: bold;
        font-size: 16px;
        display: flex;
        align-items: center;
        line-height: 40px;
        span {
          font-size: 12px;
          font-weight: normal;
          color: #b2b2b2;
        }
      }
      ul {
        display: flex;
        align-items: center;
        font-size: 14px;
        margin-left: 35px;
        flex-wrap: wrap;
        li {
          text-align: center;
          line-height: 30px;
          margin: 5px 0;
          min-width: 34px;
          display: flex;
          flex-wrap: wrap;
          .item {
            margin: 0 5px;
            width: 60px;
            p {
              width: 60px;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
              vertical-align: middle;
              margin: 0;
              margin-block-start: 0;
              margin-block-end: 0 !important;
              line-height: 20px;
              margin-top: 10px;
            }
          }
          .photo {
            display: inline-block;
            background: #abbacb;
            width: 40px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            border-radius: 2px;
            color: #fff;
            font-size: 34px;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            margin: 0 auto;
            position: relative;
            img {
              width: 100%;
              display: block;
              border: 1px solid #abbacb;
              border-radius: 2px;
            }
            i {
              position: relative;
              top: 1px;
            }
            .close {
              position: absolute;
              width: 14px;
              height: 14px;
              margin: 0;
              padding: 0;
              display: flex;
              justify-content: center;
              align-items: center;
              background: rgba(0, 0, 0, 0.6);
              border-radius: 50%;
              border: none;
              color: #fff !important;
              right: -7px;
              top: -7px;
              span {
                height: 14px;
                width: 14px;
                line-height: 14px;
                text-align: center;
                font-size: 9px;
              }
            }
          }
          .add {
            width: 40px;
            height: 40px;
            border: 1px solid #cccccc;
            line-height: 40px;
            text-align: center;
            color: #cccccc;
            margin: 0;
            padding: 0;
            border-radius: 2px;
            box-sizing: border-box;
            i {
              top: 3px;
              font-size: 34px;
            }
          }
        }
      }
    }
  }
}
</style>