<template>
  <div class="main">
    <el-row>
      <el-col :span="18" class="left-box">
        <div class="name">
          <span>{{ $store.state.user.userInfo.name }}，</span>
          欢迎进入名冠天下企业用车派车系统
        </div>
        <div class="notice">
          <img src="../assets/images/notice.png" />
          <span>你当前有</span>
          <span>
            <router-link
              :to="{ path: '/useRecord/leaveList' }"
              class="txt-color"
              style="margin:0;"
            >{{ statisData.out_uncheck }}条</router-link>
            <span>出场检查，和</span>
            <router-link
              :to="{ path: '/useRecord/returnList' }"
              class="txt-color"
              style="margin:0;"
            >{{ statisData.return_uncheck }}条</router-link>回场检查
          </span>
          <span>未处理！</span>
          <router-link :to="{ path: '/useRecord/leaveList' }" class="txt-color">立即处理>></router-link>
        </div>
        <div class="menu">
          <div class="title">快捷入口</div>
          <el-row :gutter="60">
            <el-col :span="8">
              <router-link :to="{ path: '/driver' }">
                <img src="../assets/images/driver.png" />
                司机管理
              </router-link>
            </el-col>
            <el-col :span="8">
              <router-link :to="{ path: '/approve' }">
                <img src="../assets/images/apply.png" />
                用车审批
              </router-link>
            </el-col>
            <el-col :span="8">
              <router-link :to="{ path: '/car' }">
                <img src="../assets/images/car.png" />
                车辆管理
              </router-link>
            </el-col>
            <el-col :span="8">
              <router-link :to="{ path: '/useRecord' }">
                <img src="../assets/images/use.png" />
                用车管理
              </router-link>
            </el-col>
            <el-col :span="8">
              <router-link :to="{ path: '/statistics' }">
                <img src="../assets/images/charts.png" />
                数据统计
              </router-link>
            </el-col>
            <el-col :span="8">
              <router-link :to="{ path: '/depart' }">
                <img src="../assets/images/system.png" />
                组织架构
              </router-link>
            </el-col>
            <el-col :span="8">
              <router-link :to="{ path: '/setting' }">
                <img src="../assets/images/setting.png" />
                系统设置
              </router-link>
            </el-col>
          </el-row>
        </div>
        <el-row class="advert" v-if="adShow">
          <el-col :span="24">
            <img src="@/assets/images/ads.png" />
            <i class="el-icon-error" @click="handleCancleAds"></i>
          </el-col>
        </el-row>
        <div class="car-chart">
          <div class="title">今日车辆情况统计</div>
          <div class="data-box">
            <el-row>
              <el-col :span="6">
                <p class>正在使用车辆（辆）</p>
                <p class="data">{{ statisData.using_count }}</p>
              </el-col>
              <el-col :span="6">
                <p class>用车次数（次）</p>
                <p class="data">{{ statisData.used_count }}</p>
              </el-col>
              <el-col :span="6">
                <p class>空闲车辆（辆）</p>
                <p class="data">{{ statisData.free_count }}</p>
              </el-col>
              <el-col :span="6">
                <p class>即将回库（辆）</p>
                <p class="data">{{ statisData.return_count }}</p>
              </el-col>
            </el-row>
            <div class="title">近7天用车情况统计</div>
            <div ref="driverCharts" style="width: 100%;height: 300px;margin-top:20px;"></div>
          </div>
        </div>
      </el-col>
      <el-col :span="6" class="right-box">
        <img src="../assets/images/sologo.png" />
        <div class="txt-center">成都名冠天下技术有限公司</div>
        <div class="data-box">
          <p>
            成员：
            <span class="txt-color">{{ statisData.user_count }}人</span>
          </p>
          <p>
            部门：
            <span class="txt-color">{{ statisData.dep_count }}个</span>
          </p>
        </div>
      </el-col>
    </el-row>
  </div>
</template>
<script>
import { driverChartsOptions } from "@/echarts/carCharts.js";

export default {
  name: "Index",
  data() {
    return {
      statisData: {
        out_uncheck: 0,
        return_uncheck:0,
        user_count: 0,
        dep_count: 0
      } /**统计数据 */,
      adShow: true //是否显示广告
    };
  },
  created() {
    const adsShow = sessionStorage.getItem("adShow");
    this.adShow = adsShow ? false : true;
  },
  mounted() {
    this.getData();
  },
  methods: {
    getData() {
      // data.date = Object.keys(data.sum_travel_mileage).reverse();
      // data.sum_travel_mileage = Object.values(data.sum_travel_mileage).map(
      //   Number
      // );
      // data.out_count = Object.values(data.out_count).map(Number);
      // this.statisData = data;
      let dataSource = {
        sum_travel_mileage: [1,1,0,1,0,2,1],
        out_count: [2,1,2,3,0,6,7,8],
        date:["2020-06-07","2020-06-08","2020-06-09","2020-06-10","2020-06-11","2020-06-12","2020-06-13"]
      };
      this.initChart(dataSource);
    },
    initChart(dataSource) {
      let driverCharts = this.$echarts.init(this.$refs.driverCharts);
      driverCharts.setOption(driverChartsOptions(dataSource));
    },
    handleCancleAds() {
      this.adShow = false;
      sessionStorage.setItem("adShow", 0);
    }
  }
};
</script>

<style lang="less" scope>
.main {
  background: #fff;
  .left-box {
    border-right: 1px solid #e4e6e9;
    padding: 20px 40px;
    .name {
      font-size: 18px;
      text-align: left;
      span {
        color: #2d3034;
        font-size: 22px;
        font-weight: bold;
      }
    }
    .notice {
      display: flex;
      align-items: center;
      margin-top: 30px;
      line-height: 40px;
      font-size: 14px;
      img {
        margin-right: 10px;
      }
      a {
        margin-left: 20px;
      }
    }
    .title {
      font-size: 16px;
      color: #000000;
      font-weight: bold;
      margin-top: 10px;
      line-height: 40px;
      text-align: left;
    }
    .menu {
      a {
        display: flex;
        font-size: 14px;
        color: #2d3034;
        border: 1px solid rgba(228, 230, 233, 1);
        padding: 13px 20px;
        margin: 5px 0;
        border-radius: 2px;
        &:hover {
          border-color: #0082ef;
        }
        img {
          margin-right: 10px;
          border: 0;
        }
        align-items: center;
      }
    }
    .advert {
      position: relative;
      margin: 20px 0;
      i {
        position: absolute;
        right: 0;
        top: 20px;
        color: #d2d2d2;
        font-size: 20px;
      }
    }
    .car-chart {
      .data-box {
        text-align: center;
        padding: 10px;
        p {
          color: #808080;
        }
        .data {
          font-weight: 500;
          line-height: 80px;
          font-size: 28px;
          color: #000000;
        }
      }
    }
    .el-icon-error {
      cursor: pointer;
    }
  }
  .right-box {
    padding: 40px;
    img {
      display: block;
      margin: 0 auto;
    }
    .data-box {
      margin-top: 20px;
      padding-top: 20px;
      font-size: 14px;
      line-height: 30px;
      border-top: 1px solid #e4e6e9;
    }
  }
  .txt-color {
    color: #0082ef;
  }
  .txt-center {
    text-align: center;
  }
}
</style>
