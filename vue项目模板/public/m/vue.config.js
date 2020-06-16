const path = require("path");
const theme = path.resolve(__dirname, "src/assets/theme/index.less");
const HtmlWebpackPlugin = require('html-webpack-plugin');
function resolve(dir) {
    return path.join(__dirname, dir)
}
const {
    NODE_ENV
} = process.env

const DEV = NODE_ENV === 'development'

module.exports = {
    publicPath: !DEV ? './' : '/',
    outputDir: 'dist',
    assetsDir: 'static',
    lintOnSave: false,
    productionSourceMap: false,
    chainWebpack: (config) => {
        //修改文件引入自定义路径
        config.resolve.alias
            .set('@', resolve('src'))
            .set('assets', resolve('src/assets'))
    },
    configureWebpack: config => {
        config.plugins.forEach((val) => {
            if (val instanceof HtmlWebpackPlugin) {
                val.options.title = "企业用车派车管理系统"
            }
        })
    },
    css: {
        loaderOptions: {
            less: {
                modifyVars: {
                    hack: `true; @import "${theme}";`
                }
            },
        }
    },
    devServer: {
        // 设置代理
        host: '0.0.0.0',
        proxy: {
            "/api": {
                //目标接口域名
                // target: 'http://www.car.com:9090/',
                target: 'http://dashboard.mgtx-tech-test.mgtx.com.cn',
                ws: false, // 是否启用websockets
                changOrigin: true, //开启代理
                pathRewrite: {
                    "^/api": "/"//重写接口,后面可以使重写的新路径，一般不做更改
                }
            }
        }
        // https: true
    }
}