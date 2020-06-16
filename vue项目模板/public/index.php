<?php
// +----------------------------------------------------------------------
// | ThinkPHP [ WE CAN DO IT JUST THINK ]
// +----------------------------------------------------------------------
// | Copyright (c) 2006-2018 http://thinkphp.cn All rights reserved.
// +----------------------------------------------------------------------
// | Licensed ( http://www.apache.org/licenses/LICENSE-2.0 )
// +----------------------------------------------------------------------
// | Author: liu21st <liu21st@gmail.com>
// +----------------------------------------------------------------------

// [ 应用入口文件 ]
namespace think;

// 加载基础文件
require __DIR__ . '/../thinkphp/base.php';
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Headers:content-type');
if( isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === 'http://localhost:8081'){
	header("Access-Control-Allow-Origin:http://localhost:8081");
}
else if( isset($_SERVER['HTTP_ORIGIN']) && $_SERVER['HTTP_ORIGIN'] === 'http://127.0.0.1:8080'){
	header("Access-Control-Allow-Origin:http://127.0.0.1:8080");
}else{
	//header("Access-Control-Allow-Origin:http://mgtxapproval.hostkd8cd8kf9k.mgtx.cn");
	header("Access-Control-Allow-Origin:http://mgtxbaseadmin.hostkd8cd8kf9k.mgtx.cn");
}
header("Access-Control-Allow-Methods:POST,GET,OPTIONS,PUT,DELETE");
header('Access-Control-Allow-Headers:x-requested-with,content-type');

// 支持事先使用静态方法设置Request对象和Config对象
define('ROOT',__DIR__.'/');//定义index目录
define("__ROOT__",__DIR__);
define('UPLOAD',__DIR__.'/upload/');//上传文件保存目录
define('WX_DOMAIN','https://qyapi.weixin.qq.com/');//微信通讯域名--用于调取wx信息接口
define('WX_DOMAIN_1','https://open.weixin.qq.com');
define('WX_DOMAIN_2','https://qyapi.weixin.qq.com');
define('WX_DOMAIN_3','https://open.work.weixin.qq.com');
define("ADMIN_DOMIN", "");//总后台域名
define('COMPANY_ID',1);//数据表a_company_info里面的id
define('APP_CODE','admin'); //必须的，要和a_app_settings表中的app_code字段对应
define("IS_WX3",true);
// 执行应用并响应
Container::get('app')->run()->send();
