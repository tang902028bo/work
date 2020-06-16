import Vue from "vue";
import App from "./App.vue";
import router from "./router";
import store from "./store";
import "./assets/style/main.css";
import "element-ui/lib/theme-chalk/index.css";
import ElementUI from "element-ui";
import echarts from "echarts";
import * as filters from "./filters/index";

Vue.config.productionTip = false;
Vue.use(ElementUI);
Vue.prototype.$echarts = echarts;


Object.keys(filters).forEach(key => {
  Vue.filter(key, filters[key]);
});

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount("#app");