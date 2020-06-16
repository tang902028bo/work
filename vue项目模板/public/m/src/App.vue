<template>
  <div id="app">
    <router-view />
  </div>
</template>

<script>
export default {
  name: "App"
};
</script>

<style lang="less" scope>
html,
body {
  background: #f5f5f5;
  height: 100vh;
}
#app {
  font-family:"PingFang SC","Microsoft YaHei",SCHeiti,Helvetica;
  height: 100%;
  .van-picker {
    .van-picker__toolbar {
      button {
        color: #467db9;
      }
    }
  }
  p {
    margin-block-start: 5px;
    margin-block-end: 5px;
  }
  .success {
    color: #0082ef;
  }
  .close {
    color: #ec5f50;
  }
  .aprove {
    background: #9b9b9b;
    border-radius: 8px;
    height: 8px;
    width: 8px;
    display: inline-block;
  }
  .van-tag  {
    font-size: 12px;
    height: 24px;
    line-height: 22px;
    box-sizing: border-box;
    transform: scale(0.8); transform-origin: 0% 0%;
    position: relative;
    top: 3px;
  }
}
</style>
