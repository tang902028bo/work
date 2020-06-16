<template>
  <header>
    <div class="header">
      <el-row>
        <el-col :span="19" class="logo cursor">
          <router-link :to="{ path: '/home' }">
            <img src="@/assets/images/logo-white.png" />
          </router-link>
        </el-col>
        <el-col :span="5" class="info">
          <el-avatar :src="userInfo.avatar" v-if="userInfo.avatar" :size="26"></el-avatar>
          <el-avatar icon="el-icon-user-solid" :size="26" v-else></el-avatar>
          <div>{{ userInfo.name ? `${userInfo.name},您好` : "未登录" }}</div>
          <div class="separated">|</div>
          <!-- <div class="cursor">帮助中心</div> -->
          <!-- <div class="separated">|</div> -->
          <div class="cursor copy" @click="copy">复制链接</div>
          <div class="separated">|</div>
          <div class="cursor" @click="logout">退出</div>
        </el-col>
      </el-row>
    </div>
  </header>
</template>
<script>
import { common } from "@/api";
import { mapGetters } from "vuex";
import Clipboard from 'clipboard';
export default {
  data() {
    return {
      systemName: "用车派车管理系统"
    };
  },
  computed: {
    ...mapGetters(["userInfo"])
  },
  methods: {
    logout() {
      this.$confirm("是否退出登录", "提示", {
        confirmButtonText: "确定",
        cancelButtonText: "取消",
        type: "warning"
      })
        .then(() => {
          this.loginOut();
        })
        .catch(() => {
          this.$message.info("取消操作");
        });
    },
    async loginOut() {
      const { code, data, msg } = await common.loginOut();
      if (code == 200) window.location.href = data;
      this.$message.success(msg);
    },
    copy() {
      let url = window.location;
      let clipboard = new Clipboard('.copy', {
        text: function () {
          return url
        }
      })
      clipboard.on('success', e => {
        this.$message({message: '复制成功', showClose: true, type: 'success'})
        // 释放内存
        clipboard.destroy()
      })
      clipboard.on('error', e => {
        this.$message({message: '复制失败,', showClose: true, type: 'error'})
        clipboard.destroy()
      })
    }
  }
};
</script>
<style scope>
header {
  min-width: 1280px;
  background: linear-gradient(
    315deg,
    rgba(0, 115, 212, 1) 0%,
    rgba(0, 130, 239, 1) 100%
  );
  font-size: 13px;
  position: fixed;
  width: 100%;
  top: 0;
  z-index: 66;
}
header .logo a {
  font-size: 16px;
  display: flex;
  align-items: center;
  height: 40px;
}
.header .logo-image {
  display: inline-block;
  vertical-align: middle;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #fff;
  color: #0082ef;
  line-height: 24px;
  text-align: center;
  font-size: 14px;
  margin-right: 5px;
}
header .header {
  color: #fff;
  width: 1280px;
  height: 40px;
  margin: 0 auto;
  line-height: 40px;
}
header .info {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
header .separated {
  opacity: 0.5;
}
header a {
  color: #fff;
}
header img {
  border: 0;
}
.cursor {
  cursor: pointer;
}
</style>
