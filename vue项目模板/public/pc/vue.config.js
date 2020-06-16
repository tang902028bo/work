// 配置路径别名
const path = require("path");
const resolve = dir => path.join(__dirname, dir);
const HtmlWebpackPlugin = require("html-webpack-plugin");
// const IS_PROD = ["production", "prod"].includes(process.env.NODE_ENV);
const { NODE_ENV } = process.env;

const DEV = NODE_ENV === "development";

module.exports = {
  publicPath: !DEV ? "./" : "/",
  outputDir: "dist",
  assetsDir: "static",
  lintOnSave: DEV,
  productionSourceMap: false,
  chainWebpack: config => {
    // 配置别名
    config.resolve.alias
      .set("@", resolve("src"))
      .set("@assets", resolve("src/assets"))
      .set("@components", resolve("src/components"))
      .set("@config", resolve("src/config"))
      .set("@regex", resolve("src/regex"));
  },
  configureWebpack: config => {
    config.plugins.forEach(val => {
      if (val instanceof HtmlWebpackPlugin) {
        val.options.title = "企业用车派车管理系统";
      }
    });
  },
  devServer: {
    // 设置代理
    host: "0.0.0.0",
    proxy: {
      "/api": {
        //目标接口域名
        // target: "http://www.car.com:9090/",
        target: "http://dashboard.mgtx-tech-dev.mgtx.com.cn",
        ws: true, // 是否启用websockets
        changOrigin: true, //开启代理
        pathRewrite: {
          "^/api": "" //重写接口,后面可以使重写的新路径，一般不做更改
        }
      }
    }
    // https: true
  }
};
